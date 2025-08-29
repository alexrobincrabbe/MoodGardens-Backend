// apps/api/src/workers/garden.worker.ts
import { Worker } from "bullmq";
import { redis } from "../redis.js";
import { PrismaClient } from "@prisma/client";
import type { GenerateGardenJob } from "../queues/garden.queue.js";

const prisma = new PrismaClient();

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export const gardenWorker = new Worker<GenerateGardenJob>(
  "garden-generate",
  async (job) => {
    const { gardenId, seedValue } = job.data;

    // 🔧 STUB: simulate generation (replace with real image gen later)
    await sleep(2000);
    const imageUrl = `https://picsum.photos/seed/${seedValue}/1024/1024`;
    const summary = "A calm sky with hopeful blooms.";

    await prisma.garden.update({
      where: { id: gardenId },
      data: { status: "READY", imageUrl, summary },
    });

    return { imageUrl };
  },
  { connection: redis }
);

// Mark FAILED on errors
gardenWorker.on("failed", async (job, err) => {
  if (!job) return;
  await prisma.garden.update({
    where: { id: job.data.gardenId },
    data: { status: "FAILED", summary: "Generation failed." },
  });
  console.error("[garden.worker] job failed:", err);
});
