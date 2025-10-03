// apps/api/src/graphql/resolvers.ts
import GraphQLJSON from "graphql-type-json";
import bcrypt from "bcryptjs";
import { gardenQueue } from "../queues/garden.queue.js";
import { mapGardenOut, generateShareId } from "../lib/gardens.js";
import { signJwt, setAuthCookie, clearAuthCookie, requireUser } from "../lib/auth.js";
export function createResolvers(prisma) {
    return {
        JSON: GraphQLJSON,
        Entry: {
            garden: async (parent, _args, ctx) => {
                const userId = requireUser(ctx);
                const garden = await prisma.garden.findUnique({
                    where: { userId_period_periodKey: { userId, period: "DAY", periodKey: parent.dayKey } },
                });
                return mapGardenOut(garden);
            },
        },
        Query: {
            me: async (_, __, ctx) => {
                if (!ctx.userId)
                    return null;
                return prisma.user.findUnique({
                    where: { id: ctx.userId },
                    select: { id: true, email: true, createdAt: true, displayName: true },
                });
            },
            garden: async (_, args, ctx) => {
                const userId = requireUser(ctx);
                const g = await prisma.garden.findUnique({
                    where: { userId_period_periodKey: { userId, period: args.period, periodKey: args.periodKey } },
                });
                return mapGardenOut(g);
            },
            myEntries: async (_, args, ctx) => {
                const userId = requireUser(ctx);
                return prisma.entry.findMany({
                    where: { userId },
                    orderBy: { createdAt: "desc" },
                    take: Math.min(100, Math.max(1, args.limit)),
                    skip: Math.max(0, args.offset),
                    select: { id: true, text: true, dayKey: true, createdAt: true },
                });
            },
            entryByDay: async (_, args, ctx) => {
                const userId = requireUser(ctx);
                return prisma.entry.findFirst({
                    where: { userId, dayKey: args.dayKey },
                    orderBy: { createdAt: "desc" },
                    select: { id: true, text: true, dayKey: true, createdAt: true },
                });
            },
            myGardensByMonth: async (_, args, ctx) => {
                const userId = requireUser(ctx);
                // monthKey is "YYYY-MM" (e.g. "2025-09")
                const gardens = await prisma.garden.findMany({
                    where: {
                        userId,
                        period: "DAY",
                        periodKey: { startsWith: `${args.monthKey}-` }, // matches "YYYY-MM-DD"
                    },
                    orderBy: { periodKey: "asc" },
                });
                return gardens.map(mapGardenOut);
            },
        },
        Mutation: {
            register: async (_, args, ctx) => {
                const existing = await prisma.user.findUnique({ where: { email: args.email } });
                if (existing)
                    throw new Error("Email already in use");
                const passwordHash = await bcrypt.hash(args.password, 12);
                const user = await prisma.user.create({
                    data: { email: args.email, passwordHash, displayName: args.displayName },
                    select: { id: true, email: true, createdAt: true, displayName: true },
                });
                const token = signJwt({ sub: user.id });
                setAuthCookie(ctx.res, token);
                return { user };
            },
            login: async (_, args, ctx) => {
                const u = await prisma.user.findUnique({ where: { email: args.email } });
                if (!u)
                    throw new Error("Invalid credentials");
                const ok = await bcrypt.compare(args.password, u.passwordHash);
                if (!ok)
                    throw new Error("Invalid credentials");
                const user = { id: u.id, email: u.email, createdAt: u.createdAt.toISOString() };
                const token = signJwt({ sub: user.id });
                setAuthCookie(ctx.res, token);
                return { user };
            },
            logout: async (_, __, ctx) => {
                clearAuthCookie(ctx.res);
                return true;
            },
            upsertEntry: async (_, args, ctx) => {
                const userId = requireUser(ctx);
                const entry = await prisma.entry.create({
                    data: { text: args.text, songUrl: args.songUrl ?? undefined, dayKey: args.dayKey, userId },
                });
                return {
                    ...entry,
                    mood: { valence: 0.2, arousal: 0.6, emotions: [{ key: "stress", val: 0.7 }], tags: ["study", "exam"] },
                };
            },
            updateDisplayName: async (_, args, ctx) => {
                const userId = requireUser(ctx);
                const updated = await prisma.user.update({
                    where: { id: userId },
                    data: { displayName: args.displayName },
                    select: { id: true, email: true, createdAt: true, displayName: true },
                });
                return { ...updated, createdAt: updated.createdAt.toISOString() };
            },
            requestGarden: async (_, args, ctx) => {
                const userId = requireUser(ctx);
                const seedValue = Math.floor(Math.random() * 1e9);
                let pending = await prisma.garden.upsert({
                    where: { userId_period_periodKey: { userId, period: args.period, periodKey: args.periodKey } },
                    update: {
                        status: "PENDING",
                        imageUrl: null,
                        summary: "Your garden is growing…",
                        palette: JSON.stringify({ primary: "#88c0ff" }),
                        seedValue,
                        progress: 0,
                    },
                    create: {
                        userId,
                        period: args.period,
                        periodKey: args.periodKey,
                        status: "PENDING",
                        imageUrl: null,
                        summary: "Your garden is growing…",
                        palette: JSON.stringify({ primary: "#88c0ff" }),
                        seedValue,
                        progress: 0,
                        shareId: generateShareId(),
                    },
                });
                if (!pending.shareId) {
                    pending = await prisma.garden.update({
                        where: { id: pending.id },
                        data: { shareId: generateShareId() },
                    });
                }
                await gardenQueue.add("generate", {
                    gardenId: pending.id,
                    period: args.period,
                    periodKey: args.periodKey,
                    seedValue,
                });
                return mapGardenOut(pending);
            },
        },
    };
}
