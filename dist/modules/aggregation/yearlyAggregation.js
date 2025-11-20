// apps/api/src/services/yearlyAggregation.ts
import { prisma } from "../../prismaClient.js";
import { computePeriodKeysFromDiaryContext, getPreviousYearKey, } from "../../utils/periodKeys.js";
import { gardenQueue, gardenJobOpts } from "../../queues/garden.queue.js";
import { summariseYearFromMonths } from "./periodSummaries.js";
import { generateShareId } from "../../lib/gardens.js";
const MIN_MONTHLY_GARDENS_PER_YEAR = 3;
export async function createYearlyGardenIfNeeded(user) {
    const userId = user.id;
    console.log("[YEARLY]", userId, "→ starting yearly aggregation");
    const { yearKey: currentYearKey } = computePeriodKeysFromDiaryContext(user.timezone, user.dayRolloverHour);
    const lastCompletedYearKey = getPreviousYearKey(currentYearKey);
    console.log("[YEARLY]", userId, "currentYearKey:", currentYearKey);
    console.log("[YEARLY]", userId, "lastCompletedYearKey:", lastCompletedYearKey);
    // Check if YEAR garden already exists
    const existing = await prisma.garden.findUnique({
        where: {
            userId_period_periodKey: {
                userId,
                period: "YEAR",
                periodKey: lastCompletedYearKey,
            },
        },
    });
    if (existing) {
        console.log("[YEARLY]", userId, "year garden already exists for", {
            periodKey: lastCompletedYearKey,
            gardenId: existing.id,
            status: existing.status,
        });
        return;
    }
    // Get all MONTH gardens for that year
    const monthlyGardens = await prisma.garden.findMany({
        where: {
            userId,
            period: "MONTH",
            periodKey: {
                startsWith: `${lastCompletedYearKey}-`, // e.g. "2024-"
            },
        },
        orderBy: { periodKey: "asc" },
    });
    console.log("[YEARLY]", userId, "monthly gardens in year", lastCompletedYearKey, "count:", monthlyGardens.length);
    if (monthlyGardens.length < MIN_MONTHLY_GARDENS_PER_YEAR) {
        console.log("[YEARLY]", userId, "not enough monthly gardens for year", lastCompletedYearKey, "have:", monthlyGardens.length, "required:", MIN_MONTHLY_GARDENS_PER_YEAR);
        return;
    }
    const monthlySummaries = monthlyGardens
        .map((g) => g.summary?.trim())
        .filter((s) => !!s && s.length > 0);
    if (!monthlySummaries.length) {
        console.log("[YEARLY]", userId, "no monthly summaries to summarise – aborting");
        return;
    }
    console.log("[YEARLY]", userId, "summarising year…");
    const summary = await summariseYearFromMonths(monthlySummaries);
    console.log("[YEARLY]", userId, "year summary:", summary);
    const yearGarden = await prisma.garden.create({
        data: {
            userId,
            period: "YEAR",
            periodKey: lastCompletedYearKey,
            status: "PENDING",
            summary,
            progress: 0,
            shareId: generateShareId(),
        },
    });
    console.log("[YEARLY]", userId, "created YEAR garden:", yearGarden);
    await gardenQueue.add("generate", {
        gardenId: yearGarden.id,
        period: "YEAR",
        periodKey: lastCompletedYearKey,
    }, gardenJobOpts);
    console.log("[YEARLY]", userId, "queued generate job for YEAR", lastCompletedYearKey);
}
