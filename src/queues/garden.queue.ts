// apps/api/src/queues/garden.queue.ts
import { Queue, JobsOptions } from "bullmq";
import { redis } from "../redis.js";

export type GenerateGardenJob = {
  gardenId: string;
  period: "DAY" | "WEEK" | "MONTH" | "YEAR";
  periodKey: string;
  seedValue: number;
};

// Queue instance
export const gardenQueue = new Queue<GenerateGardenJob>("garden-generate", {
  connection: redis,
});

// Optional but useful: keep the last 1k jobs, auto-clean older ones
export const gardenJobOpts: JobsOptions = {
  removeOnComplete: { count: 1000 },
  removeOnFail: { count: 1000 },
};
