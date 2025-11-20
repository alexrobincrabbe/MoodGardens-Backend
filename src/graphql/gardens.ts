import { type PrismaClient, GardenPeriod, GardenStatus } from "@prisma/client";
import { type Context, requireUser } from "../lib/auth/auth.js";
import { mapGardenOut, generateShareId  } from "../lib/gardens.js";
import { gardenQueue } from "../queues/garden.queue.js";
import { computeDiaryDayKey } from "../utils/diaryDay.js";

type GardenQueryArgs = { period: GardenPeriod; periodKey: string };
type GardenPeriodQueryArgs = { period: GardenPeriod; }
type GardenArgs = { period: GardenPeriod; periodKey: string };

//QUERIES
//--------------------------------------------------------------------------------------
//Used for fetching a garden eg. for a specific diary entry.
export function createGardenQuery(prisma: PrismaClient) {
    return (
        async (_: unknown, args: GardenQueryArgs, ctx: Context) => {
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
        }
    )
}

//fetches all gardens for a given user by period TYPE, ie week/month/year
export function createGardensByPeriodQuery(prisma: PrismaClient) {
    return (
        async (_: unknown, args: GardenPeriodQueryArgs, ctx: Context) => {
            const userId = requireUser(ctx);
            const gardens = await prisma.garden.findMany({
                where: {
                    userId,
                    period: args.period,
                }
            })
            return gardens.map(mapGardenOut)
        }
    )
}

// fetches all (period type: DAY) gardens for a given user for a given month, eg. Feb 2025
export function createGardensByMonthQuery(prisma: PrismaClient) {
    return (
        async (
            _: unknown,
            args: { monthKey: string },
            ctx: Context,
        ) => {
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
        }
    )
}

//MUTATIONS
//-------------------------------------------------------------------------

export function createRequestGenerateGardenMutation(prisma:PrismaClient){
    return(
        async (_: unknown, args: GardenArgs, ctx: Context) => {
                const userId = requireUser(ctx);

                try {
                    const user = await prisma.user.findUnique({
                        where: { id: userId },
                        select: { timezone: true, dayRolloverHour: true },
                    });

                    if (!user) {
                        console.error("[requestGenerateGarden] user not found:", { userId });
                        throw new Error("User not found");
                    }
                    let periodKey: string;
                    if (args.period === "DAY") {
                        periodKey = computeDiaryDayKey(
                            user.timezone ?? "UTC",
                            user.dayRolloverHour ?? 0
                        );
                        console.log("[requestGenerateGarden] computed DAY periodKey:", periodKey);
                    } else {
                        if (!args.periodKey) {
                            console.error(
                                "[requestGenerateGarden] missing periodKey for non-DAY period:",
                                args
                            );
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
                } catch (err) {
                    console.error("[requestGenerateGarden] ERROR:", err);
                    throw err;
                }
            }
    )
}