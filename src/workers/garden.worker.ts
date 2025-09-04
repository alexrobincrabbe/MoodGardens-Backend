// apps/api/src/workers/garden.worker.ts
import { Worker } from "bullmq";
import { redis } from "../redis.js";
import { PrismaClient } from "@prisma/client";
import type { GenerateGardenJob } from "../queues/garden.queue.js";
import OpenAI from "openai";
import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";

const prisma = new PrismaClient();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

/**
 * Build a robust image prompt for gpt-image-1 that
 * (1) instructs the model what “Mood Garden” means,
 * (2) passes the user's diary text verbatim,
 * (3) adds clear art direction and constraints.
 *
 * Note: gpt-image-1 doesn't have separate system/user roles;
 * we compose a single, strongly-phrased prompt string.
 */
function buildPromptFromDiary(args: {
  period: string;
  periodKey: string;
  diaryText?: string | null;
  seedValue: number;
}) {
  const { period, periodKey, diaryText, seedValue } = args;

  // If no diary text found, fall back to a generic calm garden prompt.
  const userText = (diaryText ?? "").trim();
  const hasDiary = userText.length > 0;

  const baseInstruction = `
You are creating a "Mood Garden": a single illustrative scene that visually reflects the emotional mood of a diary entry. 
Translate emotions to visual elements (colors, plants, weather, composition) — NOT text. 
Avoid any words or typography. Keep it whimsical, cozy, and hopeful.

Guidance:
- Color: map valence to palette (warm/bright for positive, muted/cool/desaturated for low valence; add accent hints for mixed feelings).
- Plants: calmer moods → flowing soft leaves/rounded blooms; stressed/tense → sharper leaves, denser composition; energized/aroused → dynamic curves and motion.
- Weather/sky: clear/soft glow for positive; cloudy/misty for neutral; light rain or dusk tones for heavy moods; hope can appear as soft light.
- Foreground/midground/background depth with a focal grouping of plants; gentle gradients; hand-painted feel.

Constraints:
- No text or letters.
- No frames or borders.
- Square composition (1:1).
- Family-friendly.
`.trim();

  const diarySection = hasDiary
    ? `Diary excerpt (verbatim, for mood only):
"""
${userText}
"""
`
    : `No diary text was provided; design a gentle, calming garden that suggests reflection and resilience.`;

  const context = `Generate the mood garden for ${period} ${periodKey}. Seed: ${seedValue}.`;

  // A short directive to keep image model outputs consistent
  const artDirection = `
Style:
- Soft lighting, painterly/illustrative, subtle texture.
- Stylized plants/flowers, no realistic text overlays.
- Clear focal area with harmonious color balance.
- Avoid clutter; keep it readable at small sizes.
`.trim();

  // Final prompt
  return `
Mood Garden Task:
${baseInstruction}

${diarySection}

${context}

${artDirection}
Render a single cohesive scene that embodies the diary's emotional tone through plants, color, and atmosphere. No text. Square image.
`.trim();
}

export const gardenWorker = new Worker<GenerateGardenJob>(
  "garden-generate",
  async (job) => {
    const { period, periodKey } = job.data;

    const garden = await prisma.garden.findUniqueOrThrow({
      where: { id: job.data.gardenId },
      select: { id: true, period: true, periodKey: true, seedValue: true },
    });

    // --- Progress: started
    await job.updateProgress(10);
    await prisma.garden.update({
      where: { id: garden.id },
      data: { progress: 10, summary: "Gathering inspiration from your diary…" },
    });

    // Fetch diary text for DAY period (uses your Entry.dayKey)
    // Later you can extend for WEEK/MONTH/YEAR by aggregating entries for the periodKey range.
    let diaryText: string | null = null;
    if (garden.period === "DAY") {
      const entry = await prisma.entry.findFirst({
        where: { dayKey: garden.periodKey },
        orderBy: { createdAt: "desc" },
        select: { text: true },
      });
      diaryText = entry?.text ?? null;
    }

    // --- Progress: preparing prompt
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

    // --- Progress: generating image
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
      // You can also try: style: "vivid" | "natural" (if/when available)
    });

    const b64 = imageResp.data?.[0]?.b64_json;
    if (!b64) {
      throw new Error("OpenAI image generation returned no image data.");
    }
    const buffer = Buffer.from(b64, "base64");

    // --- Progress: uploading
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
          public_id: garden.id, // idempotent URL per garden
          overwrite: true,
          format: "png",
        },
        (err, result) => (err ? reject(err) : resolve(result!))
      );
      upload.end(buffer);
    });

    // --- Progress: complete
    await job.updateProgress(100);
    await prisma.garden.update({
      where: { id: garden.id },
      data: {
        status: "READY",
        imageUrl: uploadResult.secure_url,
        summary:
          diaryText && diaryText.trim().length > 0
            ? "A garden shaped by today’s reflections."
            : "A calm, reflective garden.",
        progress: 100,
      },
    });

    return { imageUrl: uploadResult.secure_url };
  },
  { connection: redis }
);

gardenWorker.on("failed", async (job, err) => {
  if (!job) return;
  await prisma.garden.update({
    where: { id: job.data.gardenId },
    data: { status: "FAILED", summary: "Generation failed.", progress: 0 },
  });
  console.error("[garden.worker] failed:", err);
});
