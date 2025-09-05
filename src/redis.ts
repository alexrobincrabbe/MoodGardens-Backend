// apps/api/src/redis.ts
import IORedis from "ioredis";

// Prefer REDIS_URL, fall back to REDISCLOUD_URL (Heroku Redis Cloud)
const url =
  process.env.REDIS_URL ||
  process.env.REDISCLOUD_URL ||
  "redis://127.0.0.1:6379";

const useTls = url.startsWith("rediss://");

export const redis = new IORedis(url, {
  ...(useTls ? { tls: { rejectUnauthorized: false } } : {}),
  // These options help with managed Redis/proxies. Uncomment if needed:
  // maxRetriesPerRequest: null,
  // enableReadyCheck: false,
});
