// apps/api/src/services/monthlyAggregation.ts
import { prisma } from "../../prismaClient.js";
import {
  computePeriodKeysFromDiaryContext,
  getPreviousMonthKey,
  weekBelongsToMonth,
} from "../../utils/periodKeys.js";
import { gardenQueue, gardenJobOpts } from "../../queues/garden.queue.js";
import {
  summariseMonthFromWeeklyGardens,
} from "./periodSummaries.js";
import { generateShareId } from "../../lib/gardens.js";
import { encryptTextForUser } from "../../crypto/diaryEncryption.js";

const MIN_WEEKLY_GARDENS_PER_MONTH = 3;

type UserLike = {
  id: string;
  timezone: string;
  dayRolloverHour: number;
};

export async function createMonthlyGardenIfNeeded(user: UserLike) {
  const userId = user.id;
  console.log("[MONTHLY]", userId, "→ starting monthly aggregation");

  const { monthKey: currentMonthKey } = computePeriodKeysFromDiaryContext(
    user.timezone,
    user.dayRolloverHour
  );

  const lastCompletedMonthKey = getPreviousMonthKey(currentMonthKey);
  console.log("[MONTHLY]", userId, "currentMonthKey:", currentMonthKey);
  console.log("[MONTHLY]", userId, "lastCompletedMonthKey:", lastCompletedMonthKey);

  // Check if MONTH garden already exists
  const existing = await prisma.garden.findUnique({
    where: {
      userId_period_periodKey: {
        userId,
        period: "MONTH",
        periodKey: lastCompletedMonthKey,
      },
    },
  });

  if (existing) {
    console.log("[MONTHLY]", userId, "month garden already exists for", {
      periodKey: lastCompletedMonthKey,
      gardenId: existing.id,
      status: existing.status,
    });
    return;
  }

  // Fetch all WEEK gardens for this user
  const weeklyGardens = await prisma.garden.findMany({
    where: { userId, period: "WEEK" },
    orderBy: { periodKey: "asc" },
    select: {
      periodKey: true,
      summary: true,
      summaryIv: true,
      summaryAuthTag: true,
      summaryCiphertext: true,
    },
  });

  // Filter for the ones belonging to the completed month
  const weeklyInMonth = weeklyGardens.filter((g) =>
    weekBelongsToMonth(g.periodKey, lastCompletedMonthKey)
  );

  console.log("[MONTHLY]", userId, "weekly gardens in month", lastCompletedMonthKey, "count:", weeklyInMonth.length);

  if (weeklyInMonth.length < MIN_WEEKLY_GARDENS_PER_MONTH) {
    console.log(
      "[MONTHLY]",
      userId,
      "not enough weekly gardens for month",
      lastCompletedMonthKey,
      "have:",
      weeklyInMonth.length,
      "required:",
      MIN_WEEKLY_GARDENS_PER_MONTH
    );
    return;
  }

  // --- 🔐 Decrypt weekly summaries ---
  console.log("[MONTHLY]", userId, "decrypting weekly summaries…");
  const monthSummary = await summariseMonthFromWeeklyGardens(
    prisma,
    userId,
    weeklyInMonth
  );

  console.log("[MONTHLY]", userId, "month summary:", monthSummary);

  // --- 🔐 Encrypt month summary for storage ---
  const encryptedSummary = await encryptTextForUser(prisma, userId, monthSummary);

  // Create MONTH garden
  const monthGarden = await prisma.garden.create({
    data: {
      userId,
      period: "MONTH",
      periodKey: lastCompletedMonthKey,
      status: "PENDING",
      summary: "",
      // encrypted payload
      summaryIv: encryptedSummary.iv,
      summaryAuthTag: encryptedSummary.authTag,
      summaryCiphertext: encryptedSummary.ciphertext,
      summaryKeyVersion: encryptedSummary.keyVersion,
      progress: 0,
      shareId: generateShareId(),
    },
  });

  console.log("[MONTHLY]", userId, "created MONTH garden:", monthGarden);

  await gardenQueue.add(
    "generate",
    {
      gardenId: monthGarden.id,
      period: "MONTH",
      periodKey: lastCompletedMonthKey,
    },
    gardenJobOpts
  );

  console.log(
    "[MONTHLY]",
    userId,
    "queued generate job for MONTH",
    lastCompletedMonthKey
  );
}
