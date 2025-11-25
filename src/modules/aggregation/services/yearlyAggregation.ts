// apps/api/src/services/yearlyAggregation.ts
import { prisma } from "../../../lib/prismaClient.js";
import {
  computePeriodKeysFromDiaryContext,
  getPreviousYearKey,
} from "../../gardens/utils/periodKeys.js";
import { gardenQueue, gardenJobOpts } from "../../../queues/garden.queue.js";
import {
  summariseYearFromMonthlyGardens,
} from "./summaries/periodSummaries.js";
import { generateShareId } from "../../gardens/lib/gardens.js";
import { encryptTextForUser } from "../../../crypto/diaryEncryption.js";

const MIN_MONTHLY_GARDENS_PER_YEAR = 3;

type UserLike = {
  id: string;
  timezone: string;
  dayRolloverHour: number;
};

export async function createYearlyGardenIfNeeded(user: UserLike) {
  const userId = user.id;
  console.log("[YEARLY]", userId, "→ starting yearly aggregation");

  const { yearKey: currentYearKey } = computePeriodKeysFromDiaryContext(
    user.timezone,
    user.dayRolloverHour
  );

  const lastCompletedYearKey = getPreviousYearKey(currentYearKey);
  console.log("[YEARLY]", userId, "currentYearKey:", currentYearKey);
  console.log("[YEARLY]", userId, "lastCompletedYearKey:", lastCompletedYearKey);

  // Check if YEAR garden already exists
  const existing = await prisma.garden.findUnique({
    where: {
      userId_period_periodKey: {
        userId,
        period: "YEAR",
        periodKey: lastCompletedYearKey,
      },
    },
  });

  if (existing) {
    console.log("[YEARLY]", userId, "year garden already exists for", {
      periodKey: lastCompletedYearKey,
      gardenId: existing.id,
      status: existing.status,
    });
    return;
  }

  // Get all MONTH gardens for that year (with summary crypto fields)
  const monthlyGardens = await prisma.garden.findMany({
    where: {
      userId,
      period: "MONTH",
      periodKey: {
        startsWith: `${lastCompletedYearKey}-`, // e.g. "2024-"
      },
    },
    orderBy: { periodKey: "asc" },
    select: {
      periodKey: true,
      summary: true,
      summaryIv: true,
      summaryAuthTag: true,
      summaryCiphertext: true,
    },
  });

  console.log(
    "[YEARLY]",
    userId,
    "monthly gardens in year",
    lastCompletedYearKey,
    "count:",
    monthlyGardens.length
  );

  if (monthlyGardens.length < MIN_MONTHLY_GARDENS_PER_YEAR) {
    console.log(
      "[YEARLY]",
      userId,
      "not enough monthly gardens for year",
      lastCompletedYearKey,
      "have:",
      monthlyGardens.length,
      "required:",
      MIN_MONTHLY_GARDENS_PER_YEAR
    );
    return;
  }

  // 🔐 Decrypt monthly summaries and summarise the year
  console.log("[YEARLY]", userId, "decrypting monthly summaries & summarising year…");
  const summary = await summariseYearFromMonthlyGardens(
    prisma,
    userId,
    monthlyGardens
  );
  console.log("[YEARLY]", userId, "year summary:", summary);

  // 🔐 Encrypt year summary for storage
  const encryptedSummary = await encryptTextForUser(prisma, userId, summary);

  const yearGarden = await prisma.garden.create({
    data: {
      userId,
      period: "YEAR",
      periodKey: lastCompletedYearKey,
      status: "PENDING",
      summary:"",
      // encrypted payload
      summaryIv: encryptedSummary.iv,
      summaryAuthTag: encryptedSummary.authTag,
      summaryCiphertext: encryptedSummary.ciphertext,
      summaryKeyVersion: encryptedSummary.keyVersion,
      progress: 0,
      shareId: generateShareId(),
    },
  });

  console.log("[YEARLY]", userId, "created YEAR garden:", yearGarden);

  await gardenQueue.add(
    "generate",
    {
      gardenId: yearGarden.id,
      period: "YEAR",
      periodKey: lastCompletedYearKey,
    },
    gardenJobOpts
  );

  console.log(
    "[YEARLY]",
    userId,
    "queued generate job for YEAR",
    lastCompletedYearKey
  );
}
