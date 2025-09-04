import { Queue } from "bullmq";
import { redis } from "../redis.js";
// Queue instance
export const gardenQueue = new Queue("garden-generate", {
    connection: redis,
});
// Optional but useful: keep the last 1k jobs, auto-clean older ones
export const gardenJobOpts = {
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 1000 },
};
