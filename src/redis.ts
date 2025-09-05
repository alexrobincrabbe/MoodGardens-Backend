// apps/api/src/redis.js
import IORedis from "ioredis";

const url = process.env.REDIS_URL || "redis://127.0.0.1:6379";
// Enable TLS when using rediss://
const useTls = url.startsWith("rediss://");
export const redis = new IORedis(url, useTls ? { tls: { rejectUnauthorized: false } } : {});
