import { Redis, type RedisOptions } from "ioredis";

const url =
  process.env.REDISCLOUD_URL ||
  process.env.REDIS_URL ||
  "redis://127.0.0.1:6379";

const useTls = url.startsWith("rediss://");

const opts: RedisOptions = {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  ...(useTls ? { tls: { rejectUnauthorized: false } } : {}),
  connectionName: "mood-gardens",
};

export const redis = new Redis(url, opts);
