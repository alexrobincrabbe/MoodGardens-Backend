// src/services/weeklyAggregation.ts
import { prisma } from "../prismaClient.js";
import {
  computePeriodKeysFromDiaryContext,
  getPreviousWeekKey,
  getWeekRangeFromWeekKey,
} from "../utils/periodKeys.js";
import { gardenQueue, gardenJobOpts } from "../queues/garden.queue.js";
import { summariseWeek } from "./summariseWeek.js";
import { generateShareId } from "../lib/gardens.js"; // 👈 add this import (adjust path if different)


const MIN_ENTRIES_PER_WEEK = 5;

type UserLike = {
  id: string;
  timezone: string;
  dayRolloverHour: number;
};

export async function createWeeklyGardenIfNeeded(user: UserLike) {
  const userId = user.id;
  console.log("[WEEKLY]", userId, "→ starting weekly aggregation");

  const { weekKey: currentWeekKey } = computePeriodKeysFromDiaryContext(
    user.timezone,
    user.dayRolloverHour
  );
  const lastCompletedWeekKey = getPreviousWeekKey(currentWeekKey);

  console.log("[WEEKLY]", userId, "currentWeekKey:", currentWeekKey);
  console.log("[WEEKLY]", userId, "lastCompletedWeekKey:", lastCompletedWeekKey);

  // show existing WEEK gardens
  const existingWeeklyGardens = await prisma.garden.findMany({
    where: { userId, period: "WEEK" },
    orderBy: { periodKey: "asc" },
  });
  console.log("[WEEKLY]", userId, "existing WEEK gardens:", existingWeeklyGardens);

  // check if one already exists for lastCompletedWeekKey
  const existing = await prisma.garden.findUnique({
    where: {
      userId_period_periodKey: {
        userId,
        period: "WEEK",
        periodKey: lastCompletedWeekKey,
      },
    },
  });

  if (existing) {
    console.log("[WEEKLY]", userId, "garden already exists for", lastCompletedWeekKey, {
      gardenId: existing.id,
      status: existing.status,
    });
    return;
  }

  const { startDayKey, endDayKey } =
    getWeekRangeFromWeekKey(lastCompletedWeekKey);
  console.log("[WEEKLY]", userId, "week range:", { startDayKey, endDayKey });

  const entries = await prisma.diaryEntry.findMany({
    where: {
      userId,
      dayKey: {
        gte: startDayKey,
        lte: endDayKey,
      },
    },
    orderBy: { dayKey: "asc" },
  });


  if (entries.length < MIN_ENTRIES_PER_WEEK) {
    console.log(
      "[WEEKLY]",
      userId,
      "not enough entries:",
      entries.length,
      "required:",
      MIN_ENTRIES_PER_WEEK
    );
    return;
  }

  console.log("[WEEKLY]", userId, "summarising week…");
  const summary = await summariseWeek(entries);
  console.log("[WEEKLY]", userId, "summary:", summary);

 const garden = await prisma.garden.create({
  data: {
    userId: user.id,
    period: "WEEK",
    periodKey: lastCompletedWeekKey,
    status: "PENDING",
    summary,
    progress: 0,
    shareId: generateShareId(), // 👈 give weekly gardens a shareId too
  },
});


  console.log("[WEEKLY]", userId, "created WEEK garden:", garden);

await gardenQueue.add(
  "generate", // 👈 same job name that requestGenerateGarden uses
  {
    gardenId: garden.id,
    period: "WEEK",
    periodKey: lastCompletedWeekKey,
  },
  gardenJobOpts
);


  console.log(
    "[WEEKLY]",
    userId,
    "queued generate-garden job for WEEK",
    lastCompletedWeekKey
  );
}
