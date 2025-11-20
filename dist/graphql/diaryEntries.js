import { requireUser } from "../lib/auth/auth.js";
import { computeDiaryDayKey } from "../utils/diaryDay.js";
//QUERIES
//-----------------------------------------------------------------------------------------
export function createDairyEntryQuery(prisma) {
    return (async (_, args, ctx) => {
        const userId = requireUser(ctx);
        return prisma.diaryEntry.findUnique({
            where: { userId_dayKey: { userId, dayKey: args.dayKey } },
            select: { id: true, text: true, dayKey: true, createdAt: true },
        });
    });
}
export function createPaginatedEntriesQuery(prisma) {
    return (async (_, args, ctx) => {
        const userId = requireUser(ctx);
        return prisma.diaryEntry.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            take: Math.min(100, Math.max(1, args.limit)),
            skip: Math.max(0, args.offset),
            select: { id: true, text: true, dayKey: true, createdAt: true },
        });
    });
}
export function createCurrentDayKeyQuery(prisma) {
    return (async (_, __, ctx) => {
        const userId = requireUser(ctx);
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { timezone: true, dayRolloverHour: true },
        });
        if (!user)
            throw new Error("User not found");
        return computeDiaryDayKey(user.timezone ?? "UTC", user.dayRolloverHour ?? 0);
    });
}
//MUTATIONS
//--------------------------------------------------------------------------------
export function createCreateDiaryEntryMutation(prisma) {
    return (async (_, args, ctx) => {
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
    });
}
