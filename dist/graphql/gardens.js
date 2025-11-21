import { GardenPeriod, GardenStatus, } from "@prisma/client";
import { requireUser } from "../lib/auth/auth.js";
import { mapGardenOut, generateShareId } from "../lib/gardens.js";
import { gardenQueue } from "../queues/garden.queue.js";
import { computeDiaryDayKey } from "../utils/diaryDay.js";
import { decryptTextForUser } from "../crypto/diaryEncryption.js";
// 🔐 Helper: decrypt a single garden's summary if encrypted
async function decryptGardenSummaryIfNeeded(prisma, userId, garden) {
    if (!garden)
        return garden;
    if (garden.summaryCiphertext &&
        garden.summaryIv &&
        garden.summaryAuthTag) {
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
    }
    return garden;
}
// 🔐 Helper: decrypt summaries for many gardens
async function decryptGardenSummariesIfNeeded(prisma, userId, gardens) {
    return Promise.all(gardens.map((g) => decryptGardenSummaryIfNeeded(prisma, userId, g)));
}
// QUERIES
//--------------------------------------------------------------------------------------
// Used for fetching a garden eg. for a specific diary entry.
export function createGardenQuery(prisma) {
    return async (_, args, ctx) => {
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
export function createGardensByPeriodQuery(prisma) {
    return async (_, args, ctx) => {
        const userId = requireUser(ctx);
        const gardens = await prisma.garden.findMany({
            where: {
                userId,
                period: args.period,
            },
            orderBy: { periodKey: "asc" },
        });
        const decrypted = await decryptGardenSummariesIfNeeded(prisma, userId, gardens);
        return decrypted.map(mapGardenOut);
    };
}
// Fetches all (period type: DAY) gardens for a given user for a given month, eg. Feb 2025
export function createGardensByMonthQuery(prisma) {
    return async (_, args, ctx) => {
        const userId = requireUser(ctx);
        const gardens = await prisma.garden.findMany({
            where: {
                userId,
                period: GardenPeriod.DAY,
                periodKey: { startsWith: `${args.monthKey}-` },
            },
            orderBy: { periodKey: "asc" },
        });
        const decrypted = await decryptGardenSummariesIfNeeded(prisma, userId, gardens);
        return decrypted.map(mapGardenOut);
    };
}
// MUTATIONS
//-------------------------------------------------------------------------
export function createRequestGenerateGardenMutation(prisma) {
    return async (_, args, ctx) => {
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
            // Use the computed periodKey everywhere from here on
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
    };
}
