import { type PrismaClient } from "@prisma/client";
import { type Context, requireUser } from "../lib/auth/auth.js";
import { computeDiaryDayKey } from "../utils/diaryDay.js";


type CreateDiaryEntryArgs = { text: string };


//QUERIES
//-----------------------------------------------------------------------------------------
export function createDairyEntryQuery(prisma: PrismaClient) {
    return (
        async (_: unknown, args: { dayKey: string }, ctx: Context) => {
            const userId = requireUser(ctx);
            return prisma.diaryEntry.findUnique({
                where: { userId_dayKey: { userId, dayKey: args.dayKey } },
                select: { id: true, text: true, dayKey: true, createdAt: true },
            });
        }
    )
}

export function createPaginatedEntriesQuery(prisma: PrismaClient) {
    return (
        async (
            _: unknown,
            args: { limit: number; offset: number },
            ctx: Context,
        ) => {
            const userId = requireUser(ctx);
            return prisma.diaryEntry.findMany({
                where: { userId },
                orderBy: { createdAt: "desc" },
                take: Math.min(100, Math.max(1, args.limit)),
                skip: Math.max(0, args.offset),
                select: { id: true, text: true, dayKey: true, createdAt: true },
            });
        }
    )
}

export function createCurrentDayKeyQuery(prisma: PrismaClient) {
    return (
        async (_: unknown, __: unknown, ctx: Context) => {
            const userId = requireUser(ctx);
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { timezone: true, dayRolloverHour: true },
            });
            if (!user) throw new Error("User not found");
            return computeDiaryDayKey(
                user.timezone ?? "UTC",
                user.dayRolloverHour ?? 0
            );
        }
    )
}

//MUTATIONS
//--------------------------------------------------------------------------------
export function createCreateDiaryEntryMutation(prisma: PrismaClient) {
    return (
        async (
            _: unknown,
            args: CreateDiaryEntryArgs,
            ctx: Context,
        ) => {
            const userId = requireUser(ctx);

            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { timezone: true, dayRolloverHour: true },
            });

            if (!user) {
                throw new Error("User not found");
            }

            const dayKey = computeDiaryDayKey(
                user.timezone ?? "UTC",
                user.dayRolloverHour ?? 0,
            );

            const diaryEntry = await prisma.diaryEntry.create({
                data: { text: args.text, dayKey, userId },
            });

            return diaryEntry;
        }
    )
}

