// apps/api/src/workers/garden.worker.ts
import { Worker } from "bullmq";
import { redis } from "../redis.js";
import { PrismaClient } from "@prisma/client";
import type { GenerateGardenJob } from "../queues/garden.queue.js";
import OpenAI from "openai";
import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";
import { buildPromptFromDiary } from "./utils/buildPrompt.js";

const prisma = new PrismaClient();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export const gardenWorker = new Worker<GenerateGardenJob>(
  "garden-generate",
  async (job) => {
    const { period, periodKey } = job.data;

    const garden = await prisma.garden.findUniqueOrThrow({
      where: { id: job.data.gardenId },
      select: { id: true, period: true, periodKey: true, seedValue: true },
    });

    await job.updateProgress(10);
    await prisma.garden.update({
      where: { id: garden.id },
      data: { progress: 10, summary: "Gathering inspiration from your diary…" },
    });

    let diaryText: string | null = null;
    if (garden.period === "DAY") {
      const entry = await prisma.entry.findFirst({
        where: { dayKey: garden.periodKey },
        orderBy: { createdAt: "desc" },
        select: { text: true },
      });
      diaryText = entry?.text ?? null;
    }

    await job.updateProgress(30);
    await prisma.garden.update({
      where: { id: garden.id },
      data: { progress: 30, summary: "Sketching your garden’s vibe…" },
    });

    const prompt = buildPromptFromDiary({
      period: garden.period,
      periodKey: garden.periodKey,
      diaryText,
      seedValue: garden.seedValue,
    });

    await job.updateProgress(50);
    await prisma.garden.update({
      where: { id: garden.id },
      data: { progress: 50, summary: "Painting plants & colors…" },
    });

    const imageResp = await openai.images.generate({
      model: "gpt-image-1",
      prompt,
      size: "1024x1024",
      quality: "low",
    });

    const b64 = imageResp.data?.[0]?.b64_json;
    if (!b64) throw new Error("OpenAI image generation returned no image data.");
    const buffer = Buffer.from(b64, "base64");

    await job.updateProgress(75);
    await prisma.garden.update({
      where: { id: garden.id },
      data: { progress: 75, summary: "Adding final touches & uploading…" },
    });

    const uploadResult = await new Promise<UploadApiResponse>((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        {
          resource_type: "image",
          folder: "mood-gardens",
          public_id: garden.id,         // idempotent: one asset per garden
          overwrite: true,
          // ▲ If you overwrite, consider invalidation to purge CDN cache:
          invalidate: true,             // optional but handy during iteration
          format: "png",
        },
        (err, result) => (err ? reject(err) : resolve(result!))
      );
      upload.end(buffer);
    });

    // ▲ uploadResult.public_id includes the folder, e.g. "mood-gardens/<gardenId>"
    //   This is exactly what you should store as your Cloudinary publicId.
    await job.updateProgress(100);
    await prisma.garden.update({
      where: { id: garden.id },
      data: {
        status: "READY",
        imageUrl: uploadResult.secure_url,   // legacy/fallback
        publicId: uploadResult.public_id,    // ▲ NEW: primary identifier for Cloudinary
        summary:
          diaryText && diaryText.trim().length > 0
            ? "A garden shaped by today’s reflections."
            : "A calm, reflective garden.",
        progress: 100,
      },
    });

    // ▲ Return both for debugging/logs
    return { imageUrl: uploadResult.secure_url, publicId: uploadResult.public_id };
  },
  { connection: redis }
);

// --- Logging (you have duplicated 'failed' handlers—keep one)
gardenWorker.on("ready", () => {
  console.log("[garden.worker] ready and listening");
});
gardenWorker.on("active", (job) => {
  console.log("[garden.worker] processing", job.id, "gardenId=", job.data.gardenId);
});
gardenWorker.on("completed", (job, result) => {
  console.log("[garden.worker] completed", job.id, result);
});
gardenWorker.on("failed", async (job, err) => {
  if (!job) return;
  await prisma.garden.update({
    where: { id: job.data.gardenId },
    data: { status: "FAILED", summary: "Generation failed.", progress: 0 },
  });
  console.error("[garden.worker] failed:", err);
});
