// apps/api/src/services/periodSummaries.ts
import OpenAI from "openai";
import type { PrismaClient, Garden } from "@prisma/client";
import { decryptTextForUser } from "../../crypto/diaryEncryption.js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

async function summariseFromSummaries(
  label: string,
  summaries: string[]
): Promise<string> {
  if (!summaries.length) {
    throw new Error(`No summaries provided for ${label} summarisation`);
  }

  const combined = summaries.join("\n\n---\n\n");

  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.4,
    messages: [
      {
        role: "system",
        content: `
You are an assistant that creates reflective emotional overviews of longer time periods 
(weeks, months, or years) based on shorter summaries.
Write in the second person ("you"), and keep a warm, calm tone. 
Return a concise but rich paragraph (or two) that describes the emotional arc, themes, and tone 
across the whole ${label.toLowerCase()}.
        `.trim(),
      },
      {
        role: "user",
        content: `
Here are the component summaries for this ${label.toLowerCase()}:

${combined}

Please write a single coherent summary for the entire ${label.toLowerCase()}.
        `.trim(),
      },
    ],
  });

  const text = res.choices[0]?.message?.content?.trim();
  if (!text) {
    throw new Error(`OpenAI did not return a summary for ${label}`);
  }
  return text;
}

/**
 * Old helpers that just work on plaintext string arrays.
 * These are still useful when you already have decrypted strings.
 */
export async function summariseMonthFromWeeks(
  weeklySummaries: string[]
): Promise<string> {
  return summariseFromSummaries("Month", weeklySummaries);
}

export async function summariseYearFromMonths(
  monthlySummaries: string[]
): Promise<string> {
  return summariseFromSummaries("Year", monthlySummaries);
}

/**
 * 🔐 NEW: helpers that take encrypted Garden summaries,
 * decrypt them for a user, and then summarise.
 */

type GardenSummaryFields = Pick<
  Garden,
  "summary" | "summaryIv" | "summaryAuthTag" | "summaryCiphertext"
>;

/**
 * Decrypt an array of Garden summaries for a user, falling back to plaintext
 * `summary` if the crypto fields are missing (for older rows).
 */
async function decryptGardenSummaries(
  prisma: PrismaClient,
  userId: string,
  gardens: GardenSummaryFields[]
): Promise<string[]> {
  const result: string[] = [];

  for (const g of gardens) {
    let text: string | null = null;

    if (g.summaryCiphertext && g.summaryIv && g.summaryAuthTag) {
      // encrypted path
      text = await decryptTextForUser(prisma, userId, {
        iv: g.summaryIv,
        authTag: g.summaryAuthTag,
        ciphertext: g.summaryCiphertext,
      });
    }

    // fallback to plaintext summary if needed
    const final = (text ?? g.summary ?? "").trim();
    if (final) {
      result.push(final);
    }
  }

  return result;
}

/**
 * 🔐 Summarise a month from an array of WEEK gardens (with encrypted summaries).
 */
export async function summariseMonthFromWeeklyGardens(
  prisma: PrismaClient,
  userId: string,
  weeklyGardens: GardenSummaryFields[]
): Promise<string> {
  const weeklySummaries = await decryptGardenSummaries(
    prisma,
    userId,
    weeklyGardens
  );
  return summariseMonthFromWeeks(weeklySummaries);
}

/**
 * 🔐 Summarise a year from an array of MONTH gardens (with encrypted summaries).
 */
export async function summariseYearFromMonthlyGardens(
  prisma: PrismaClient,
  userId: string,
  monthlyGardens: GardenSummaryFields[]
): Promise<string> {
  const monthlySummaries = await decryptGardenSummaries(
    prisma,
    userId,
    monthlyGardens
  );
  return summariseYearFromMonths(monthlySummaries);
}
