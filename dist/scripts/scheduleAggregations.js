// src/scripts/scheduleAggregations.ts
import { aggregationQueue } from "../queues/aggregation.queue.js";
async function scheduleAggregations() {
    console.log("[aggregation] Scheduling daily aggregation job…");
    await aggregationQueue.add("run-aggregations", {}, {
        // Run every day at 05:00 UTC (adjust as you like)
        repeat: {
            pattern: "*/5 * * * *", // every 15 minutes
        },
        removeOnComplete: true,
        removeOnFail: true,
    });
    console.log("[aggregation] Daily aggregation job scheduled.");
}
scheduleAggregations()
    .catch((err) => {
    console.error("[aggregation] Failed to schedule job:", err);
    process.exit(1);
})
    .finally(() => process.exit(0));
