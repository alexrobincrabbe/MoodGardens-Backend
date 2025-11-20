// src/workers/aggregation.worker.ts
import { Worker } from "bullmq";
import { redis } from "../redis.js";
import { runAggregations } from "../modules/aggregation/aggregation.js";
const worker = new Worker("aggregation", async (job) => {
    if (job.name === "run-aggregations") {
        await runAggregations();
    }
}, {
    connection: redis,
});
worker.on("completed", (job) => {
    console.log(`[aggregation] job completed: ${job.id}`);
});
worker.on("failed", (job, err) => {
    console.error(`[aggregation] job failed: ${job?.id}`, err);
});
