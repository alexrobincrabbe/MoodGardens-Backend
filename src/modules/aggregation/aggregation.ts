import { prisma } from "../../lib/prismaClient.js";
import { createWeeklyGardenIfNeeded } from "./services/weeklyAggregation.js";
import { createMonthlyGardenIfNeeded } from "./services/monthlyAggregation.js";
import { createYearlyGardenIfNeeded } from "./services/yearlyAggregation.js";

export async function runAggregations() {
    console.log("[aggregation] Starting aggregation run…");
    const users = await prisma.user.findMany({
        select: { id: true, timezone: true, dayRolloverHour: true },
    });

    for (const user of users) {
        try {
            await createWeeklyGardenIfNeeded(user);
            await createMonthlyGardenIfNeeded(user);
            await createYearlyGardenIfNeeded(user);
        } catch (err) {
            console.error(`[aggregation] Error aggregating for user ${user.id}`, err);
        }
    }

    console.log("[aggregation] Aggregation run finished.");
}
