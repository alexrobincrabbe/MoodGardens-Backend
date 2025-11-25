import {
    type PrismaClient,
    GardenPeriod,
    GardenStatus,
} from "@prisma/client";
import { type Context, requireUser } from "../../users/lib/auth.js";
import { mapGardenOut, generateShareId } from "../lib/gardens.js";
import { gardenQueue } from "../../../queues/garden.queue.js";
import { computeDiaryDayKey } from "../../diary/utils/diaryDayKey.js";
import { decryptTextForUser } from "../../../crypto/diaryEncryption.js";

type GardenQueryArgs = { period: GardenPeriod; periodKey: string };
type GardenPeriodQueryArgs = { period: GardenPeriod };
type GardenArgs = { period: GardenPeriod; periodKey: string };

// 🔐 Helper: decrypt a single garden's summary if encrypted
async function decryptGardenSummaryIfNeeded(
    prisma: PrismaClient,
    userId: string,
    garden: any | null
) {
    if (!garden) return garden;

    if (
        garden.summaryCiphertext &&
        garden.summaryIv &&
        garden.summaryAuthTag
    ) {
        try {
            const decrypted = await decryptTextForUser(prisma, userId, {
                iv: garden.summaryIv,
                authTag: garden.summaryAuthTag,
                ciphertext: garden.summaryCiphertext,
            });

            if (decrypted) {
                return {
                    ...garden,
                    summary: decrypted,
                };
            }
        } catch (err) {
            console.error(
                "[garden] decrypt summary failed; falling back to plaintext/empty",
                { gardenId: garden.id, userId },
                err
            );
        }
    }


    return garden;
}

// 🔐 Helper: decrypt summaries for many gardens
async function decryptGardenSummariesIfNeeded(
    prisma: PrismaClient,
    userId: string,
    gardens: any[]
) {
    return Promise.all(
        gardens.map((g) => decryptGardenSummaryIfNeeded(prisma, userId, g)),
    );
}

// QUERIES
//--------------------------------------------------------------------------------------
// Used for fetching a garden eg. for a specific diary entry.
export function createGardenQuery(prisma: PrismaClient) {
    return async (_: unknown, args: GardenQueryArgs, ctx: Context) => {
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

        const decrypted = await decryptGardenSummaryIfNeeded(prisma, userId, g);
        return mapGardenOut(decrypted);
    };
}

// Fetches all gardens for a given user by period TYPE, ie week/month/year
export function createGardensByPeriodQuery(prisma: PrismaClient) {
    return async (_: unknown, args: GardenPeriodQueryArgs, ctx: Context) => {
        const userId = requireUser(ctx);
        const gardens = await prisma.garden.findMany({
            where: {
                userId,
                period: args.period,
            },
            orderBy: { periodKey: "asc" },
        });

        const decrypted = await decryptGardenSummariesIfNeeded(
            prisma,
            userId,
            gardens,
        );
        return decrypted.map(mapGardenOut);
    };
}

// Fetches all (period type: DAY) gardens for a given user for a given month, eg. Feb 2025
export function createGardensByMonthQuery(prisma: PrismaClient) {
    return async (_: unknown, args: { monthKey: string }, ctx: Context) => {
        const userId = requireUser(ctx);
        const gardens = await prisma.garden.findMany({
            where: {
                userId,
                period: GardenPeriod.DAY,
                periodKey: { startsWith: `${args.monthKey}-` },
            },
            orderBy: { periodKey: "asc" },
        });

        const decrypted = await decryptGardenSummariesIfNeeded(
            prisma,
            userId,
            gardens,
        );
        return decrypted.map(mapGardenOut);
    };
}

// MUTATIONS
//-------------------------------------------------------------------------

export function createRequestGenerateGardenMutation(prisma: PrismaClient) {
    return async (_: unknown, args: GardenArgs, ctx: Context) => {
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
                    user.dayRolloverHour ?? 0,
                );
            } else {
                if (!args.periodKey) {
                    console.error(
                        "[requestGenerateGarden] missing periodKey for non-DAY period:",
                        args,
                    );
                    throw new Error("periodKey is required for non-DAY gardens");
                }
                periodKey = args.periodKey;
            }
            let pending = await prisma.garden.create({
                data: {
                    userId,
                    period: args.period,
                    periodKey,
                    status: GardenStatus.PENDING,
                    summary: "Your garden is growing…",
                    progress: 0,
                    shareId: generateShareId(),
                },
            });

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
    };
}
