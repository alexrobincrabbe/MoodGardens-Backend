import { Queue } from "bullmq";
import { redis } from "../lib/redis.js";
export const gardenQueue = new Queue("garden-generate", {
    connection: redis,
});
export const gardenJobOpts = {
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 1000 },
};
