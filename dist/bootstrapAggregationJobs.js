// src/bootstrapAggregationJobs.ts
import { aggregationQueue } from "./queues/aggregation.queue.js";
export async function setupAggregationJobs() {
    await aggregationQueue.add("run-aggregations", {}, {
        repeat: {
            pattern: "0 3 * * *", // every day at 03:00 UTC
            tz: "UTC",
        },
        removeOnComplete: { count: 1000 },
        removeOnFail: { count: 1000 },
    });
}
