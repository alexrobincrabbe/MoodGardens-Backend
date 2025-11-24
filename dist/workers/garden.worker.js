// apps/api/src/workers/garden.worker.ts
import { Worker } from "bullmq";
import { redis } from "../redis.js";
import { GardenStatus } from "@prisma/client";
import { prisma } from "../prismaClient.js";
import OpenAI from "openai";
import { v2 as cloudinary } from "cloudinary";
import { buildPromptFromDiary } from "./utils/buildPromptFromDiary.js"; // now async
import { decryptDiaryForUser } from "../crypto/diaryEncryption.js";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
export const gardenWorker = new Worker("garden-generate", async (job) => {
    const { gardenId } = job.data;
    try {
        const { garden, originalSummary } = await fetchGarden(gardenId);
        await job.updateProgress(10);
        const sourceText = await fetchAndDecryptDiaryOrSummary(garden);
        await job.updateProgress(30);
        const prompt = await analyseText({ garden, sourceText });
        await job.updateProgress(50);
        const buffer = await growGarden({ garden, prompt });
        await job.updateProgress(75);
        const uploadResult = await uploadGarden({ garden, buffer });
        const finalSummary = await setFinalSummary({ garden, sourceText, originalSummary });
        await job.updateProgress(100);
        const updated = await updateGarden({ garden, uploadResult, finalSummary });
        console.log("[garden.worker] finished garden:", updated.id, {
            status: updated.status,
            progress: updated.progress,
            imageUrl: updated.imageUrl,
            publicId: updated.publicId,
        });
    }
    catch (err) {
        console.error("[garden.worker] job failed", { gardenId }, err);
        try {
            await prisma.garden.update({
                where: { id: gardenId },
                data: {
                    status: GardenStatus.FAILED,
                    progress: 100,
                    summary: "We couldn't finish this garden due to an error.",
                },
            });
        }
        catch (updateErr) {
            console.error("[garden.worker] failed to update garden status after error", { gardenId }, updateErr);
        }
        throw err;
    }
}, { connection: redis });
async function fetchGarden(gardenId) {
    const garden = await prisma.garden.findUniqueOrThrow({
        where: { id: gardenId },
    });
    const originalSummary = garden.summary;
    return { garden, originalSummary };
}
async function fetchAndDecryptDiaryOrSummary(garden) {
    await prisma.garden.update({
        where: { id: garden.id },
        data: {
            progress: 10,
            summary: "Gathering inspiration from your diary…",
        },
    });
    let sourceText = null;
    if (garden.period === "DAY") {
        const diaryEntry = await prisma.diaryEntry.findFirst({
            where: {
                userId: garden.userId,
                dayKey: garden.periodKey,
            },
            orderBy: { createdAt: "desc" },
            select: {
                text: true, // legacy/plaintext fallback
                iv: true,
                authTag: true,
                ciphertext: true,
            },
        });
        if (diaryEntry) {
            try {
                const decrypted = await decryptDiaryForUser(prisma, garden.userId, diaryEntry);
                sourceText =
                    (decrypted && decrypted.trim().length > 0
                        ? decrypted
                        : diaryEntry.text && diaryEntry.text.trim().length > 0
                            ? diaryEntry.text
                            : null);
            }
            catch (err) {
                console.error("[garden.worker] decryptDiaryForUser failed; falling back to plaintext / empty", { gardenId: garden.id, userId: garden.userId }, err);
                sourceText =
                    diaryEntry.text && diaryEntry.text.trim().length > 0
                        ? diaryEntry.text
                        : null;
            }
        }
        else {
            return sourceText = null;
        }
    }
    else {
        // WEEK / MONTH / YEAR: use the garden.summary that the aggregator created
        return sourceText = garden.summary ?? null;
    }
}
async function growGarden({ garden, prompt }) {
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
    return buffer;
}
async function uploadGarden({ garden, buffer }) {
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
    return uploadResult;
}
async function analyseText({ garden, sourceText }) {
    await prisma.garden.update({
        where: { id: garden.id },
        data: { progress: 30, summary: "Analysing your mood & themes…" },
    });
    const { prompt } = await buildPromptFromDiary({
        diaryText: sourceText && sourceText.trim().length > 0
            ? sourceText
            : "This diary entry was empty.",
        openai,
    });
    return prompt;
}
async function setFinalSummary({ garden, sourceText, originalSummary }) {
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
    return finalSummary;
}
async function updateGarden({ garden, uploadResult, finalSummary }) {
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
    return updated;
}
