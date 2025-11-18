// src/services/aggregation.ts
import { prisma } from "../prismaClient.js";
import { createWeeklyGardenIfNeeded } from "./weeklyAggregation.js";
//import { createMonthlyGardenIfNeeded } from "./monthlyAggregation";
//import { createYearlyGardenIfNeeded } from "./yearlyAggregation";
export async function runAggregations() {
    console.log("[aggregation] Starting aggregation run…");
    const users = await prisma.user.findMany({
        select: { id: true, timezone: true, dayRolloverHour: true },
    });
    for (const user of users) {
        try {
            await createWeeklyGardenIfNeeded(user);
            //await createMonthlyGardenIfNeeded(user);
            //await createYearlyGardenIfNeeded(user);
        }
        catch (err) {
            console.error(`[aggregation] Error aggregating for user ${user.id}`, err);
        }
    }
    console.log("[aggregation] Aggregation run finished.");
}
