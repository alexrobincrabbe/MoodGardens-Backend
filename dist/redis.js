// apps/api/src/redis.ts
import { Redis } from "ioredis";
// Prefer Heroku Redis Cloud var, then REDIS_URL, then local dev
const url = process.env.REDISCLOUD_URL ||
    process.env.REDIS_URL ||
    "redis://127.0.0.1:6379";
const useTls = url.startsWith("rediss://");
const opts = {
    // BullMQ requirement (for blocking commands)
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    // Enable TLS if using a rediss:// endpoint
    ...(useTls ? { tls: { rejectUnauthorized: false } } : {}),
    // Optional niceties:
    // connectionName: "mood-gardens",
};
export const redis = new Redis(url, opts);
