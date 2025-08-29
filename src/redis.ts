// apps/api/src/redis.ts
import IORedis from "ioredis";

export const REDIS_URL = process.env.REDIS_URL ?? "redis://localhost:6379";
export const redis = new IORedis(REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
}); 
