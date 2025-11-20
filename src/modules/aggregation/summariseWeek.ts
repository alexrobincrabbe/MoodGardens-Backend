// src/services/summariseWeek.ts
import OpenAI from "openai";
import type { DiaryEntry } from "@prisma/client";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function summariseWeek(
  entries: DiaryEntry[]
): Promise<string> {
  const text = entries
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
