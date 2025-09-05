// apps/api/src/index.ts
import { ApolloServer } from "@apollo/server";
import { PrismaClient } from "@prisma/client";
import GraphQLJSON from "graphql-type-json";
import { gardenQueue } from "./queues/garden.queue.js";
import express from "express";
import cors from "cors";
import { expressMiddleware } from "@apollo/server/express4";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "dev-insecure-secret";
// Where the public /share/:id page will be served from (must actually route there)
const PUBLIC_ORIGIN = process.env.PUBLIC_ORIGIN || "http://localhost:4000";
// Your web client origin (used for CORS and the “Open Mood Gardens” link)
const APP_ORIGIN = process.env.APP_ORIGIN || "http://localhost:5173";
// Optional: comma-separated list of allowed CORS origins (overrides APP_ORIGIN if provided)
const CORS_ORIGINS = (process.env.CORS_ORIGINS || APP_ORIGIN)
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);
// Cookie settings for prod (when frontend and backend are on different sites use SameSite=None + secure)
const COOKIE_SECURE = process.env.COOKIE_SECURE === "true"; // e.g. true in prod (HTTPS)
const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || undefined; // e.g. ".moodgardens.app"
// --- GraphQL schema (SDL) ---
const typeDefs = `#graphql
  scalar JSON

  enum GardenPeriod { DAY WEEK MONTH YEAR }
  enum GardenStatus { PENDING READY FAILED }

  type Mood {
    valence: Float!
    arousal: Float!
    emotions: [KeyVal!]!
    tags: [String!]!
  }
  type KeyVal { key: String!, val: Float! }

  type User {
    id: ID!
    email: String!
    createdAt: String!
  }

  type Entry {
    id: ID!
    text: String!
    dayKey: String!
    createdAt: String!
    mood: Mood!
    garden: Garden
  }

  type Garden {
    id: ID!
    period: GardenPeriod!
    periodKey: String!
    status: GardenStatus!
    imageUrl: String
    palette: JSON
    seedValue: Int!
    summary: String
    progress: Int!
    shareUrl: String      # <-- NEW: public share URL hosted by this API
    createdAt: String!
    updatedAt: String!
  }

  type AuthPayload {
    user: User!
  }

  type Query {
    me: User
    garden(period: GardenPeriod!, periodKey: String!): Garden
    myEntries(limit: Int!, offset: Int!): [Entry!]!
    entryByDay(dayKey: String!): Entry
  }

  type Mutation {
    register(email: String!, password: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    logout: Boolean!

    upsertEntry(text: String!, songUrl: String, dayKey: String!): Entry!
    requestGarden(period: GardenPeriod!, periodKey: String!): Garden!
  }
`;
// Helpers
function generateShareId() {
    // short, URL-safe id
    return crypto.randomBytes(8).toString("hex"); // 16 hex chars
}
function mapGardenOut(garden) {
    if (!garden)
        return null;
    return {
        ...garden,
        palette: garden.palette ? JSON.parse(garden.palette) : null,
        shareUrl: garden.shareId ? `${PUBLIC_ORIGIN}/share/${garden.shareId}` : null,
    };
}
function signJwt(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });
}
function setAuthCookie(res, token) {
    res.cookie("mg_jwt", token, {
        httpOnly: true,
        sameSite: COOKIE_SECURE ? "none" : "lax",
        secure: COOKIE_SECURE,
        domain: COOKIE_DOMAIN,
        maxAge: 30 * 24 * 60 * 60 * 1000,
        path: "/",
    });
}
function clearAuthCookie(res) {
    res.clearCookie("mg_jwt", { httpOnly: true, sameSite: "lax", secure: false, path: "/" });
}
function requireUser(ctx) {
    if (!ctx.userId)
        throw new Error("Not authenticated");
    return ctx.userId;
}
const resolvers = {
    JSON: GraphQLJSON,
    Entry: {
        garden: async (parent, _args, ctx) => {
            const userId = requireUser(ctx);
            const g = await prisma.garden.findUnique({
                where: { userId_period_periodKey: { userId, period: "DAY", periodKey: parent.dayKey } },
            });
            return mapGardenOut(g);
        },
    },
    Query: {
        me: async (_p, _a, ctx) => {
            if (!ctx.userId)
                return null;
            return prisma.user.findUnique({
                where: { id: ctx.userId },
                select: { id: true, email: true, createdAt: true },
            });
        },
        garden: async (_parent, args, ctx) => {
            const userId = requireUser(ctx);
            const { period, periodKey } = args;
            const g = await prisma.garden.findUnique({
                where: { userId_period_periodKey: { userId, period, periodKey } },
            });
            return mapGardenOut(g);
        },
        myEntries: async (_p, args, ctx) => {
            const userId = requireUser(ctx);
            const { limit, offset } = args;
            return prisma.entry.findMany({
                where: { userId },
                orderBy: { createdAt: "desc" },
                take: Math.min(100, Math.max(1, limit)),
                skip: Math.max(0, offset),
                select: {
                    id: true,
                    text: true,
                    dayKey: true,
                    createdAt: true,
                },
            });
        },
        entryByDay: async (_p, args, ctx) => {
            const userId = requireUser(ctx);
            return prisma.entry.findFirst({
                where: { userId, dayKey: args.dayKey },
                orderBy: { createdAt: "desc" },
                select: { id: true, text: true, dayKey: true, createdAt: true },
            });
        },
    },
    Mutation: {
        register: async (_p, args, ctx) => {
            const { email, password } = args;
            const existing = await prisma.user.findUnique({ where: { email } });
            if (existing)
                throw new Error("Email already in use");
            const passwordHash = await bcrypt.hash(password, 12);
            const user = await prisma.user.create({
                data: { email, passwordHash },
                select: { id: true, email: true, createdAt: true },
            });
            const token = signJwt({ sub: user.id });
            setAuthCookie(ctx.res, token);
            return { user };
        },
        login: async (_p, args, ctx) => {
            const { email, password } = args;
            const u = await prisma.user.findUnique({ where: { email } });
            if (!u)
                throw new Error("Invalid credentials");
            const ok = await bcrypt.compare(password, u.passwordHash);
            if (!ok)
                throw new Error("Invalid credentials");
            const user = { id: u.id, email: u.email, createdAt: u.createdAt.toISOString() };
            const token = signJwt({ sub: user.id });
            setAuthCookie(ctx.res, token);
            return { user };
        },
        logout: async (_p, _a, ctx) => {
            clearAuthCookie(ctx.res);
            return true;
        },
        upsertEntry: async (_parent, args, ctx) => {
            const userId = requireUser(ctx);
            const { text, songUrl, dayKey } = args;
            const entry = await prisma.entry.create({
                data: { text, songUrl: songUrl ?? undefined, dayKey, userId },
            });
            return {
                ...entry,
                mood: {
                    valence: 0.2,
                    arousal: 0.6,
                    emotions: [{ key: "stress", val: 0.7 }],
                    tags: ["study", "exam"],
                },
            };
        },
        requestGarden: async (_parent, args, ctx) => {
            const userId = requireUser(ctx);
            const { period, periodKey } = args;
            const seedValue = Math.floor(Math.random() * 1e9);
            // Upsert or reset to PENDING
            let pending = await prisma.garden.upsert({
                where: { userId_period_periodKey: { userId, period, periodKey } },
                update: {
                    status: "PENDING",
                    imageUrl: null,
                    summary: "Your garden is growing…",
                    palette: JSON.stringify({ primary: "#88c0ff" }),
                    seedValue,
                    progress: 0,
                    // Do NOT touch shareId here; might already exist
                },
                create: {
                    userId,
                    period,
                    periodKey,
                    status: "PENDING",
                    imageUrl: null,
                    summary: "Your garden is growing…",
                    palette: JSON.stringify({ primary: "#88c0ff" }),
                    seedValue,
                    progress: 0,
                    shareId: generateShareId(), // create with shareId
                },
            });
            // If an existing record had no shareId (older rows), assign one now
            if (!pending.shareId) {
                pending = await prisma.garden.update({
                    where: { id: pending.id },
                    data: { shareId: generateShareId() },
                });
            }
            await gardenQueue.add("generate", {
                gardenId: pending.id,
                period,
                periodKey,
                seedValue,
            });
            return mapGardenOut(pending);
        },
    },
};
async function main() {
    const app = express();
    app.use(cors({
        origin: CORS_ORIGINS,
        credentials: true,
    }));
    app.use(cookieParser());
    app.use(express.json());
    // --- Public share page with OpenGraph tags ---
    app.get("/share/:shareId", async (req, res) => {
        const { shareId } = req.params;
        const garden = await prisma.garden.findUnique({ where: { shareId } });
        if (!garden) {
            res.status(404).send("<h1>Not found</h1>");
            return;
        }
        const title = `Mood Gardens — ${garden.period} ${garden.periodKey}`;
        const desc = garden.summary || "A garden grown from my day.";
        const img = garden.imageUrl || "";
        const canonical = `${PUBLIC_ORIGIN}/share/${shareId}`;
        const viewLink = garden.period === "DAY"
            ? `${APP_ORIGIN}/today`
            : `${APP_ORIGIN}/gardens`;
        // Minimal OG page
        const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${escapeHtml(title)}</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="canonical" href="${canonical}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Mood Gardens">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(desc)}">
${img ? `<meta property="og:image" content="${img}">` : ""}
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(title)}">
<meta name="twitter:description" content="${escapeHtml(desc)}">
${img ? `<meta name="twitter:image" content="${img}">` : ""}
<style>
  body { font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; padding: 24px; line-height: 1.5; }
  .card { max-width: 680px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; }
  .img { display: block; width: 100%; }
  .content { padding: 16px; }
  .btn { display: inline-block; border: 1px solid #111; padding: 8px 12px; border-radius: 8px; text-decoration: none; color: #111; }
</style>
</head>
<body>
  <div class="card">
    ${img ? `<img class="img" src="${img}" alt="Mood garden image">` : ""}
    <div class="content">
      <h1>${escapeHtml(title)}</h1>
      <p>${escapeHtml(desc)}</p>
      <a class="btn" href="${viewLink}">Open Mood Gardens</a>
    </div>
  </div>
</body>
</html>`;
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.send(html);
    });
    const server = new ApolloServer({ typeDefs, resolvers });
    await server.start();
    app.use("/graphql", expressMiddleware(server, {
        context: async ({ req, res }) => {
            let userId = null;
            const token = req.cookies?.["mg_jwt"];
            if (token) {
                try {
                    const decoded = jwt.verify(token, JWT_SECRET);
                    userId = decoded?.sub ?? null;
                }
                catch {
                    userId = null;
                }
            }
            return { userId, req, res };
        },
    }));
    app.get("/healthz", (_req, res) => res.send("ok"));
    app.listen(4000, () => {
        console.log("GraphQL on http://localhost:4000/graphql");
        console.log(`Public shares on ${PUBLIC_ORIGIN}/share/:shareId`);
    });
}
function escapeHtml(s) {
    return s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}
main().catch((err) => {
    console.error(err);
    process.exit(1);
});
