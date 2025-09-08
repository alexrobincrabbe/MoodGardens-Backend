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
// normalize helpers
const normalizeOrigin = (s: string) => s.replace(/\/+$/, "");

// Where the public /share/:id page will be served from (must actually route there)
const PUBLIC_ORIGIN = normalizeOrigin(process.env.PUBLIC_ORIGIN || "http://localhost:4000");
// Your web client origin (used for CORS and the “Open Mood Gardens” link)
const APP_ORIGIN = normalizeOrigin(process.env.APP_ORIGIN || "http://localhost:5173");

// Optional: comma-separated list of allowed CORS origins (overrides APP_ORIGIN if provided)
const CORS_ORIGINS = (process.env.CORS_ORIGINS || APP_ORIGIN)
    .split(",")
    .map(s => normalizeOrigin(s.trim()))
    .filter(Boolean);
// Build allowlist and dynamic CORS options (reuse existing APP_ORIGIN, CORS_ORIGINS)
const allowedOrigins = new Set<string>([APP_ORIGIN, ...CORS_ORIGINS]);

const corsOptions: cors.CorsOptions = {
    origin(origin, cb) {
        if (!origin) return cb(null, true); // non-browser / same-origin
        try {
            const host = new URL(origin).hostname;
            if (allowedOrigins.has(origin) || /\.vercel\.app$/.test(host)) {
                return cb(null, true);
            }
        } catch {
            /* ignore */
        }
        return cb(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Apollo-Require-Preflight"],
};


// Cookie settings for prod (when frontend and backend are on different sites use SameSite=None + secure)
const COOKIE_SECURE = process.env.COOKIE_SECURE === "true";       // e.g. true in prod (HTTPS)
const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || undefined;     // e.g. ".moodgardens.app"

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

type GardenPeriod = "DAY" | "WEEK" | "MONTH" | "YEAR";

type GardenArgs = {
    period: GardenPeriod;
    periodKey: string;
};

type UpsertEntryArgs = {
    text: string;
    songUrl?: string | null;
    dayKey: string;
};

type RegisterArgs = { email: string; password: string };
type LoginArgs = { email: string; password: string };

type Context = {
    userId: string | null;
    req: express.Request;
    res: express.Response;
};

// Helpers
function generateShareId() {
    // short, URL-safe id
    return crypto.randomBytes(8).toString("hex"); // 16 hex chars
}

function shareUrlFor(id: string) {
    return new URL(`share/${id}`, PUBLIC_ORIGIN + "/").toString(); // always single slash
}

function mapGardenOut(garden: any) {
    if (!garden) return null;
    return {
        ...garden,
        palette: garden.palette ? JSON.parse(garden.palette) : null,
        shareUrl: garden.shareId ? shareUrlFor(garden.shareId) : null,
    };
}

function signJwt(payload: object) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });
}

function setAuthCookie(res: express.Response, token: string) {
    res.cookie("mg_jwt", token, {
        httpOnly: true,
        sameSite: COOKIE_SECURE ? "none" : "lax",
        secure: COOKIE_SECURE,
        domain: COOKIE_DOMAIN,
        maxAge: 30 * 24 * 60 * 60 * 1000,
        path: "/",
    });
}

function clearAuthCookie(res: express.Response) {
    res.clearCookie("mg_jwt", { httpOnly: true, sameSite: "lax", secure: false, path: "/" });
}
function requireUser(ctx: Context): string {
    if (!ctx.userId) throw new Error("Not authenticated");
    return ctx.userId;
}

const resolvers = {
    JSON: GraphQLJSON,

    Entry: {
        garden: async (parent: any, _args: any, ctx: Context) => {
            const userId = requireUser(ctx);
            const g = await prisma.garden.findUnique({
                where: { userId_period_periodKey: { userId, period: "DAY", periodKey: parent.dayKey } },
            });
            return mapGardenOut(g);
        },
    },

    Query: {
        me: async (_p: unknown, _a: unknown, ctx: Context) => {
            if (!ctx.userId) return null;
            return prisma.user.findUnique({
                where: { id: ctx.userId },
                select: { id: true, email: true, createdAt: true },
            });
        },

        garden: async (_parent: unknown, args: GardenArgs, ctx: Context) => {
            const userId = requireUser(ctx);
            const { period, periodKey } = args;
            const g = await prisma.garden.findUnique({
                where: { userId_period_periodKey: { userId, period, periodKey } },
            });
            return mapGardenOut(g);
        },

        myEntries: async (_p: unknown, args: { limit: number; offset: number }, ctx: Context) => {
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

        entryByDay: async (_p: unknown, args: { dayKey: string }, ctx: Context) => {
            const userId = requireUser(ctx);
            return prisma.entry.findFirst({
                where: { userId, dayKey: args.dayKey },
                orderBy: { createdAt: "desc" },
                select: { id: true, text: true, dayKey: true, createdAt: true },
            });
        },
    },

    Mutation: {
        register: async (_p: unknown, args: RegisterArgs, ctx: Context) => {
            const { email, password } = args;
            const existing = await prisma.user.findUnique({ where: { email } });
            if (existing) throw new Error("Email already in use");
            const passwordHash = await bcrypt.hash(password, 12);
            const user = await prisma.user.create({
                data: { email, passwordHash },
                select: { id: true, email: true, createdAt: true },
            });
            const token = signJwt({ sub: user.id });
            setAuthCookie(ctx.res, token);
            return { user };
        },

        login: async (_p: unknown, args: LoginArgs, ctx: Context) => {
            const { email, password } = args;
            const u = await prisma.user.findUnique({ where: { email } });
            if (!u) throw new Error("Invalid credentials");
            const ok = await bcrypt.compare(password, u.passwordHash);
            if (!ok) throw new Error("Invalid credentials");
            const user = { id: u.id, email: u.email, createdAt: u.createdAt.toISOString() };
            const token = signJwt({ sub: user.id });
            setAuthCookie(ctx.res, token);
            return { user };
        },

        logout: async (_p: unknown, _a: unknown, ctx: Context) => {
            clearAuthCookie(ctx.res);
            return true;
        },

        upsertEntry: async (_parent: unknown, args: UpsertEntryArgs, ctx: Context) => {
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

        requestGarden: async (_parent: unknown, args: GardenArgs, ctx: Context) => {
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
    app.use((req, _res, next) => {
        console.log("[API]", req.method, req.url);
        next();
    });

    // accept with or without .json
    app.get(["/share-meta/:shareId", "/share-meta/:shareId.json"], async (req, res) => {
        const { shareId } = req.params;
        console.log("[share-meta] requested:", shareId);

        const garden = await prisma.garden.findUnique({ where: { shareId } });
        console.log("[share-meta] found:", !!garden);

        if (!garden) return res.status(404).json({ error: "not_found" });

        const title = `Mood Gardens — ${garden.period} ${garden.periodKey}`;
        const desc = garden.summary || "A garden grown from my day.";
        const img = garden.imageUrl || null;
        const viewLink = garden.period === "DAY" ? `${APP_ORIGIN}/today` : `${APP_ORIGIN}/gardens`;
        res.json({ title, desc, img, period: garden.period, periodKey: garden.periodKey, viewLink });
    });
    app.use((req, _res, next) => {
        console.log("[API]", req.method, req.url);
        next();
    });

    app.set("trust proxy", 1); // needed behind Heroku/NGINX for secure cookies, IPs
    app.use(cors(corsOptions));
    app.options("*", cors(corsOptions)); // handle preflight

    app.use(cookieParser());
    app.use(express.json());

    // --- Public share page with OpenGraph tags ---
    app.get("/share-meta/:shareId.json", async (req, res) => {
        const { shareId } = req.params;
        const garden = await prisma.garden.findUnique({ where: { shareId } });
        if (!garden) return res.status(404).json({ error: "not_found" });

        const title = `Mood Gardens — ${garden.period} ${garden.periodKey}`;
        const desc = garden.summary || "A garden grown from my day.";
        const img = garden.imageUrl || null;

        const viewLink =
            garden.period === "DAY" ? `${APP_ORIGIN}/today` : `${APP_ORIGIN}/gardens`;

        res.json({
            title,
            desc,
            img,
            period: garden.period,
            periodKey: garden.periodKey,
            viewLink,
        });
        console.log("[share-meta] requested:", shareId, "found:", !!garden);

    });
    console.log("Mounted /share-meta route");



    const server = new ApolloServer({ typeDefs, resolvers });
    await server.start();


    // ✅ Public share metadata (accept with or without .json; strip suffix)
    app.get(["/share-meta/:shareId", "/share-meta/:shareId.json"], async (req, res) => {
        const raw = String(req.params.shareId || "");
        const shareId = raw.replace(/\.json$/i, ""); // strip .json if present
        console.log("[share-meta] requested raw:", raw, "normalized:", shareId);

        const garden = await prisma.garden.findUnique({ where: { shareId } });
        console.log("[share-meta] found:", !!garden);
        if (!garden) return res.status(404).json({ error: "not_found" });

        const title = `Mood Gardens — ${garden.period} ${garden.periodKey}`;
        const desc = garden.summary || "A garden grown from my day.";
        const img = garden.imageUrl || null;
        const viewLink = garden.period === "DAY" ? `${APP_ORIGIN}/today` : `${APP_ORIGIN}/gardens`;
        res.json({ title, desc, img, period: garden.period, periodKey: garden.periodKey, viewLink });
    });

    app.use(
        "/graphql",
        expressMiddleware(server, {
            context: async ({ req, res }): Promise<Context> => {
                let userId: string | null = null;
                const token = req.cookies?.["mg_jwt"];
                if (token) {
                    try {
                        const decoded = jwt.verify(token, JWT_SECRET) as { sub?: string };
                        userId = decoded?.sub ?? null;
                    } catch {
                        userId = null;
                    }
                }
                return { userId, req, res };
            },
        })
    );

    app.get("/healthz", (_req, res) => res.send("ok"));

    const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
    app.listen(PORT, () => {
        console.log(`GraphQL on http://0.0.0.0:${PORT}/graphql`);
        console.log(`Public shares on ${PUBLIC_ORIGIN}/share/:shareId`);
    });
}

function escapeHtml(s: string) {
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
