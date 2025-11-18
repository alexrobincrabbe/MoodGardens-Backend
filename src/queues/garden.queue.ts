import { Queue, JobsOptions } from "bullmq";
import { redis } from "../redis.js";

export type GenerateGardenJob = {
  gardenId: string;
  period: "DAY" | "WEEK" | "MONTH" | "YEAR";
  periodKey: string;
};

export const gardenQueue = new Queue<GenerateGardenJob>("garden-generate", {
  connection: redis,
});

export const gardenJobOpts: JobsOptions = {
  removeOnComplete: { count: 1000 },
  removeOnFail: { count: 1000 },
};

