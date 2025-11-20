// apps/api/src/services/monthlyAggregation.ts
import { prisma } from "../../prismaClient.js";
import {
  computePeriodKeysFromDiaryContext,
  getPreviousMonthKey,
  weekBelongsToMonth,
} from "../../utils/periodKeys.js";
import { gardenQueue, gardenJobOpts } from "../../queues/garden.queue.js";
import { summariseMonthFromWeeks } from "./periodSummaries.js";
import { generateShareId } from "../../lib/gardens.js";

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

  // Has MONTH garden already been created?
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
    where: {
      userId,
      period: "WEEK",
    },
    orderBy: { periodKey: "asc" },
  });

  // Filter those that belong to lastCompletedMonthKey
  const weeklyInMonth = weeklyGardens.filter((g) =>
    weekBelongsToMonth(g.periodKey, lastCompletedMonthKey)
  );

  console.log(
    "[MONTHLY]",
    userId,
    "weekly gardens in month",
    lastCompletedMonthKey,
    "count:",
    weeklyInMonth.length
  );

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

  const weeklySummaries = weeklyInMonth
    .map((g) => g.summary?.trim())
    .filter((s): s is string => !!s && s.length > 0);

  if (!weeklySummaries.length) {
    console.log("[MONTHLY]", userId, "no weekly summaries to summarise – aborting");
    return;
  }

  console.log("[MONTHLY]", userId, "summarising month…");
  const summary = await summariseMonthFromWeeks(weeklySummaries);
  console.log("[MONTHLY]", userId, "month summary:", summary);

  const monthGarden = await prisma.garden.create({
    data: {
      userId,
      period: "MONTH",
      periodKey: lastCompletedMonthKey,
      status: "PENDING",
      summary,
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
