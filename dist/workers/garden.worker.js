// apps/api/src/workers/garden.worker.ts
import { Worker } from "bullmq";
import { redis } from "../redis.js";
import { PrismaClient, GardenStatus } from "@prisma/client";
import OpenAI from "openai";
import { v2 as cloudinary } from "cloudinary";
import { buildPromptFromDiary } from "./utils/buildPrompt.js"; // now async
const prisma = new PrismaClient();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
export const gardenWorker = new Worker("garden-generate", async (job) => {
    const { period, periodKey } = job.data;
    const garden = await prisma.garden.findUniqueOrThrow({
        where: { id: job.data.gardenId },
        select: { id: true, period: true, periodKey: true },
    });
    await job.updateProgress(10);
    await prisma.garden.update({
        where: { id: garden.id },
        data: { progress: 10, summary: "Gathering inspiration from your diary…" },
    });
    let diaryText = null;
    if (garden.period === "DAY") {
        const diaryEntry = await prisma.diaryEntry.findFirst({
            where: { dayKey: garden.periodKey },
            orderBy: { createdAt: "desc" },
            select: { text: true },
        });
        diaryText = diaryEntry?.text ?? null;
    }
    await job.updateProgress(30);
    await prisma.garden.update({
        where: { id: garden.id },
        data: { progress: 30, summary: "Analysing your mood & themes…" },
    });
    // 🔴 CHANGED: prompt now comes from an async LLM-based builder
    const prompt = await buildPromptFromDiary({
        period: garden.period,
        periodKey: garden.periodKey,
        diaryText,
        openai, // pass the client in
    });
    await job.updateProgress(50);
    await prisma.garden.update({
        where: { id: garden.id },
        data: { progress: 50, summary: "Painting plants & colors…" },
    });
    console.log("[garden.worker] image prompt:", prompt);
    const imageResp = await openai.images.generate({
        model: "gpt-image-1",
        prompt,
        size: "1024x1024",
        quality: "low",
    });
    const b64 = imageResp.data?.[0]?.b64_json;
    if (!b64)
        throw new Error("OpenAI image generation returned no image data.");
    const buffer = Buffer.from(b64, "base64");
    await job.updateProgress(75);
    await prisma.garden.update({
        where: { id: garden.id },
        data: { progress: 75, summary: "Adding final touches & uploading…" },
    });
    const uploadResult = await new Promise((resolve, reject) => {
        const upload = cloudinary.uploader.upload_stream({
            resource_type: "image",
            folder: "mood-gardens",
            public_id: garden.id,
            overwrite: true,
            invalidate: true,
            format: "png",
        }, (err, result) => (err ? reject(err) : resolve(result)));
        upload.end(buffer);
    });
    await job.updateProgress(100);
    await prisma.garden.update({
        where: { id: garden.id },
        data: {
            status: GardenStatus.READY,
            imageUrl: uploadResult.secure_url,
            publicId: uploadResult.public_id,
            summary: diaryText && diaryText.trim().length > 0
                ? "A garden shaped by today’s reflections."
                : "A calm, reflective garden.",
            progress: 100,
        },
    });
    return { imageUrl: uploadResult.secure_url, publicId: uploadResult.public_id };
}, { connection: redis });
// logging stays the same…
