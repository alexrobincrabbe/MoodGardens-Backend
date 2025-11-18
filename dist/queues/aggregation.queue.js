import { redis } from "../redis.js";
import { Queue } from "bullmq";
export const aggregationQueue = new Queue("aggregation", {
    connection: redis,
});
