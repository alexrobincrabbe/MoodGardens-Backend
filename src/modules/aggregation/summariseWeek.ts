// src/services/summariseWeek.ts
import OpenAI from "openai";
import type { DiaryEntry, PrismaClient } from "@prisma/client";

// 🔐 import decrypt helper
import { decryptDiaryForUser } from "../../crypto/diaryEncryption.js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

/**
 * Summarise a week of diary entries, decrypting each one first.
 */
export async function summariseWeek(
  prisma: PrismaClient,
  userId: string,
  entries: Pick<DiaryEntry, "text" | "ciphertext" | "iv" | "authTag" | "dayKey">[]
): Promise<string> {

  // 🔐 Decrypt each entry (or fall back to plaintext)
  const decryptedEntries = await Promise.all(
    entries.map(async (e) => {
      const decrypted =
        e.ciphertext && e.iv && e.authTag
          ? await decryptDiaryForUser(prisma, userId, e)
          : null;

      return {
        dayKey: e.dayKey,
        text: decrypted ?? e.text ?? "",
      };
    })
  );

  const text = decryptedEntries
    .map((e) => `- ${e.dayKey}: ${e.text}`)
    .join("\n");

  const messages = [
    {
      role: "system" as const,
      content:
        "You summarise a week of diary entries into a single emotional theme. Be empathetic and concise.",
    },
    {
      role: "user" as const,
      content: `
Summarise the following diary entries as one coherent description of the week.
Focus on prevailing emotions, repeating themes, and how the mood changed over time.
Return 1–2 short paragraphs as plain text.

Entries:
${text}
      `.trim(),
    },
  ];

  const res = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    temperature: 0.4,
    messages,
  });

  return res.choices[0].message.content ?? "A reflective week.";
}
