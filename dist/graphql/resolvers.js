import GraphQLJSON from "graphql-type-json";
import bcrypt from "bcryptjs";
import { gardenQueue } from "../queues/garden.queue.js";
import { mapGardenOut, generateShareId } from "../lib/gardens.js";
import { signJwt, setAuthCookie, clearAuthCookie, requireUser, } from "../lib/auth.js";
import { GardenPeriod, GardenStatus } from "@prisma/client";
import { computeDiaryDayKey } from "../utils/diaryDay.js";
const UserPublicFields = {
    id: true,
    email: true,
    displayName: true,
    createdAt: true,
    timezone: true,
    dayRolloverHour: true,
    notifyWeeklyGarden: true,
    notifyMonthlyGarden: true,
    notifyYearlyGarden: true,
};
export function createResolvers(prisma) {
    return {
        JSON: GraphQLJSON,
        DiaryEntry: {
            garden: async (parent, _args, ctx) => {
                const userId = requireUser(ctx);
                const garden = await prisma.garden.findUnique({
                    where: {
                        userId_period_periodKey: {
                            userId,
                            period: GardenPeriod.DAY,
                            periodKey: parent.dayKey,
                        },
                    },
                });
                return mapGardenOut(garden);
            },
        },
        Query: {
            user: async (_, __, ctx) => {
                if (!ctx.userId)
                    return null;
                return prisma.user.findUnique({
                    where: { id: ctx.userId },
                    select: UserPublicFields,
                });
            },
            diaryEntry: async (_, args, ctx) => {
                const userId = requireUser(ctx);
                return prisma.diaryEntry.findUnique({
                    where: { userId_dayKey: { userId, dayKey: args.dayKey } },
                    select: { id: true, text: true, dayKey: true, createdAt: true },
                });
            },
            paginatedDiaryEntries: async (_, args, ctx) => {
                const userId = requireUser(ctx);
                return prisma.diaryEntry.findMany({
                    where: { userId },
                    orderBy: { createdAt: "desc" },
                    take: Math.min(100, Math.max(1, args.limit)),
                    skip: Math.max(0, args.offset),
                    select: { id: true, text: true, dayKey: true, createdAt: true },
                });
            },
            garden: async (_, args, ctx) => {
                const userId = requireUser(ctx);
                const g = await prisma.garden.findUnique({
                    where: {
                        userId_period_periodKey: {
                            userId,
                            period: args.period,
                            periodKey: args.periodKey,
                        },
                    },
                });
                return mapGardenOut(g);
            },
            gardensByMonth: async (_, args, ctx) => {
                const userId = requireUser(ctx);
                const gardens = await prisma.garden.findMany({
                    where: {
                        userId,
                        period: GardenPeriod.DAY,
                        periodKey: { startsWith: `${args.monthKey}-` },
                    },
                    orderBy: { periodKey: "asc" },
                });
                return gardens.map(mapGardenOut);
            },
            currentDiaryDayKey: async (_, __, ctx) => {
                const userId = requireUser(ctx); // or return null if you want it anonymous-safe
                const user = await prisma.user.findUnique({
                    where: { id: userId },
                    select: { timezone: true, dayRolloverHour: true },
                });
                if (!user)
                    throw new Error("User not found");
                return computeDiaryDayKey(user.timezone ?? "UTC", user.dayRolloverHour ?? 0);
            },
        },
        Mutation: {
            register: async (_, args, ctx) => {
                const existing = await prisma.user.findUnique({
                    where: { email: args.email },
                });
                if (existing)
                    throw new Error("Email already in use");
                const passwordHash = await bcrypt.hash(args.password, 12);
                const user = await prisma.user.create({
                    data: {
                        email: args.email,
                        passwordHash,
                        displayName: args.displayName,
                    },
                    select: UserPublicFields,
                });
                const token = signJwt({ sub: user.id });
                setAuthCookie(ctx.res, token);
                return { user };
            },
            login: async (_, args, ctx) => {
                const u = await prisma.user.findUnique({
                    where: { email: args.email },
                });
                if (!u)
                    throw new Error("Invalid credentials");
                const ok = await bcrypt.compare(args.password, u.passwordHash);
                if (!ok)
                    throw new Error("Invalid credentials");
                const user = {
                    id: u.id,
                    email: u.email,
                    createdAt: u.createdAt,
                    displayName: u.displayName,
                };
                const token = signJwt({ sub: user.id });
                setAuthCookie(ctx.res, token);
                return { user };
            },
            logout: async (_, __, ctx) => {
                clearAuthCookie(ctx.res);
                return true;
            },
            updateDisplayName: async (_, args, ctx) => {
                const userId = requireUser(ctx);
                const updated = await prisma.user.update({
                    where: { id: userId },
                    data: { displayName: args.displayName },
                    select: { id: true, email: true, createdAt: true, displayName: true },
                });
                return updated;
            },
            createDiaryEntry: async (_, args, ctx) => {
                const userId = requireUser(ctx);
                const user = await prisma.user.findUnique({
                    where: { id: userId },
                    select: { timezone: true, dayRolloverHour: true },
                });
                if (!user) {
                    throw new Error("User not found");
                }
                const dayKey = computeDiaryDayKey(user.timezone ?? "UTC", user.dayRolloverHour ?? 0);
                const diaryEntry = await prisma.diaryEntry.create({
                    data: { text: args.text, dayKey, userId },
                });
                return diaryEntry;
            },
            updateUserSettings: async (_, args, ctx) => {
                const userId = requireUser(ctx);
                // Clamp rollover hour to [0, 23] just to be safe
                const safeHour = Math.min(23, Math.max(0, Math.floor(args.dayRolloverHour)));
                const updated = await prisma.user.update({
                    where: { id: userId },
                    data: {
                        timezone: args.timezone,
                        dayRolloverHour: safeHour,
                    },
                    select: UserPublicFields,
                });
                return updated;
            },
            requestGenerateGarden: async (_, args, ctx) => {
                const userId = requireUser(ctx);
                try {
                    // 1) Load user settings for timezone + rollover
                    const user = await prisma.user.findUnique({
                        where: { id: userId },
                        select: { timezone: true, dayRolloverHour: true },
                    });
                    if (!user) {
                        console.error("[requestGenerateGarden] user not found:", { userId });
                        throw new Error("User not found");
                    }
                    // 2) Decide which periodKey to actually use
                    let periodKey;
                    if (args.period === "DAY") {
                        periodKey = computeDiaryDayKey(user.timezone ?? "UTC", user.dayRolloverHour ?? 0);
                        console.log("[requestGenerateGarden] computed DAY periodKey:", periodKey);
                    }
                    else {
                        if (!args.periodKey) {
                            console.error("[requestGenerateGarden] missing periodKey for non-DAY period:", args);
                            throw new Error("periodKey is required for non-DAY gardens");
                        }
                        periodKey = args.periodKey;
                    }
                    // 3) Use the *computed* periodKey everywhere from here on
                    let pending = await prisma.garden.upsert({
                        where: {
                            userId_period_periodKey: {
                                userId,
                                period: args.period,
                                periodKey,
                            },
                        },
                        update: {
                            status: GardenStatus.PENDING,
                            imageUrl: null,
                            summary: "Your garden is growing…",
                            progress: 0,
                        },
                        create: {
                            userId,
                            period: args.period,
                            periodKey,
                            status: GardenStatus.PENDING,
                            imageUrl: null,
                            summary: "Your garden is growing…",
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
                        periodKey,
                    });
                    const result = mapGardenOut(pending);
                    return result;
                }
                catch (err) {
                    console.error("[requestGenerateGarden] ERROR:", err);
                    throw err;
                }
            },
        },
    };
}
