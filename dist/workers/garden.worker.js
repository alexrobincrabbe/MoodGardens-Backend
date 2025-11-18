// apps/api/src/workers/garden.worker.ts
import { Worker } from "bullmq";
import { redis } from "../redis.js";
import { GardenStatus } from "@prisma/client";
import { prisma } from "../prismaClient.js";
import OpenAI from "openai";
import { v2 as cloudinary } from "cloudinary";
import { buildPromptFromDiary } from "./utils/buildPromptFromDiary.js"; // now async
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
export const gardenWorker = new Worker("garden-generate", async (job) => {
    const { gardenId } = job.data;
    const garden = await prisma.garden.findUniqueOrThrow({
        where: { id: gardenId },
        select: {
            id: true,
            period: true,
            periodKey: true,
            userId: true,
            summary: true,
        },
    });
    // Keep the original summary so we can restore it for WEEK/MONTH/YEAR
    const originalSummary = garden.summary;
    await job.updateProgress(10);
    await prisma.garden.update({
        where: { id: garden.id },
        data: {
            progress: 10,
            // progress text – OK to show as "status text"
            summary: "Gathering inspiration from your diary…",
        },
    });
    // Decide what text we feed into the prompt builder
    let sourceText = null;
    if (garden.period === "DAY") {
        // Daily gardens: use the diary entry text for that day
        const diaryEntry = await prisma.diaryEntry.findFirst({
            where: {
                userId: garden.userId,
                dayKey: garden.periodKey,
            },
            orderBy: { createdAt: "desc" },
            select: { text: true },
        });
        sourceText = diaryEntry?.text ?? null;
    }
    else {
        // WEEK / MONTH / YEAR: use the garden.summary that the aggregator created
        sourceText = garden.summary ?? null;
    }
    await job.updateProgress(30);
    await prisma.garden.update({
        where: { id: garden.id },
        data: { progress: 30, summary: "Analysing your mood & themes…" },
    });
    const { prompt /* , mood */ } = await buildPromptFromDiary({
        diaryText: sourceText && sourceText.trim().length > 0
            ? sourceText
            : "A reflective period in the diary, to be rendered as a symbolic garden.",
        openai,
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
    if (!b64)
        throw new Error("OpenAI image generation returned no image data.");
    const buffer = Buffer.from(b64, "base64");
    await job.updateProgress(75);
    await prisma.garden.update({
        where: { id: garden.id },
        data: {
            progress: 75,
            summary: "Adding final touches & uploading…",
        },
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
    // Decide final summary:
    //  - DAY: keep your existing generic text
    //  - WEEK/MONTH/YEAR: restore aggregator's summary if present
    let finalSummary;
    if (garden.period === "DAY") {
        finalSummary =
            sourceText && sourceText.trim().length > 0
                ? "A garden shaped by today’s reflections."
                : "A calm, reflective garden.";
    }
    else {
        finalSummary =
            originalSummary && originalSummary.trim().length > 0
                ? originalSummary
                : "A garden reflecting this period in your life.";
    }
    await job.updateProgress(100);
    const updated = await prisma.garden.update({
        where: { id: garden.id },
        data: {
            status: GardenStatus.READY,
            imageUrl: uploadResult.secure_url,
            publicId: uploadResult.public_id,
            summary: finalSummary,
            progress: 100,
        },
    });
    console.log("[garden.worker] finished garden:", updated.id, {
        status: updated.status,
        progress: updated.progress,
        imageUrl: updated.imageUrl,
        publicId: updated.publicId,
    });
    return {
        imageUrl: uploadResult.secure_url,
        publicId: uploadResult.public_id,
    };
}, { connection: redis });
