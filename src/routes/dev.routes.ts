// apps/api/src/routes/dev.routes.ts
import { Router } from "express";
import { prisma } from "../prismaClient.js";
import { createWeeklyGardenIfNeeded } from "../modules/aggregation/weeklyAggregation.js";
import { createMonthlyGardenIfNeeded } from "../modules/aggregation/monthlyAggregation.js";
import { createYearlyGardenIfNeeded } from "../modules/aggregation/yearlyAggregation.js";
import { backfillWeeklyGardensForUser } from "../modules/aggregation/weeklyAggregation.js";

export const devRouter = Router();

devRouter.post("/test-weekly-garden", async (req, res) => {
  try {
    const userId = req.body.userId as string | undefined;
    console.log("[DEV] Running WEEKLY test for user:", userId);

    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, timezone: true, dayRolloverHour: true },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const weeklyBefore = await prisma.garden.findMany({
      where: { userId, period: "WEEK" },
      orderBy: { periodKey: "asc" },
    });
    console.log("[DEV] WEEK gardens BEFORE:", userId, weeklyBefore);

    await createWeeklyGardenIfNeeded(user);

    const weeklyAfter = await prisma.garden.findMany({
      where: { userId, period: "WEEK" },
      orderBy: { periodKey: "asc" },
    });
    console.log("[DEV] WEEK gardens AFTER:", userId, weeklyAfter);

    return res.json({ ok: true });
  } catch (err) {
    console.error("[DEV] Error in /test-weekly-garden:", err);
    return res.status(500).json({
      error: "Error generating weekly garden",
      details: err instanceof Error ? err.message : String(err),
    });
  }
});

devRouter.post("/test-monthly-garden", async (req, res) => {
  try {
    const userId = req.body.userId as string | undefined;
    console.log("[DEV] Running MONTHLY test for user:", userId);

    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, timezone: true, dayRolloverHour: true },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const monthlyBefore = await prisma.garden.findMany({
      where: { userId, period: "MONTH" },
      orderBy: { periodKey: "asc" },
    });
    console.log("[DEV] MONTH gardens BEFORE:", userId, monthlyBefore);

    await createMonthlyGardenIfNeeded(user);

    const monthlyAfter = await prisma.garden.findMany({
      where: { userId, period: "MONTH" },
      orderBy: { periodKey: "asc" },
    });
    console.log("[DEV] MONTH gardens AFTER:", userId, monthlyAfter);

    return res.json({ ok: true });
  } catch (err) {
    console.error("[DEV] Error in /test-monthly-garden:", err);
    return res.status(500).json({
      error: "Error generating monthly garden",
      details: err instanceof Error ? err.message : String(err),
    });
  }
});

devRouter.post("/test-yearly-garden", async (req, res) => {
  try {
    const userId = req.body.userId as string | undefined;
    console.log("[DEV] Running YEARLY test for user:", userId);

    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, timezone: true, dayRolloverHour: true },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const yearlyBefore = await prisma.garden.findMany({
      where: { userId, period: "YEAR" },
      orderBy: { periodKey: "asc" },
    });
    console.log("[DEV] YEAR gardens BEFORE:", userId, yearlyBefore);

    await createYearlyGardenIfNeeded(user);

    const yearlyAfter = await prisma.garden.findMany({
      where: { userId, period: "YEAR" },
      orderBy: { periodKey: "asc" },
    });
    console.log("[DEV] YEAR gardens AFTER:", userId, yearlyAfter);

    return res.json({ ok: true });
  } catch (err) {
    console.error("[DEV] Error in /test-yearly-garden:", err);
    return res.status(500).json({
      error: "Error generating yearly garden",
      details: err instanceof Error ? err.message : String(err),
    });
  }
});


devRouter.post("/backfill-weekly-gardens", async (req, res) => {
  try {
    const userId = req.body.userId as string | undefined;
    const maxWeeksAgo = req.body.maxWeeksAgo as number | undefined;

    console.log("[DEV] Running WEEKLY BACKFILL for user:", userId, "maxWeeksAgo:", maxWeeksAgo);

    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, timezone: true, dayRolloverHour: true },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    await backfillWeeklyGardensForUser(user, { maxWeeksAgo });

    const weeklyGardens = await prisma.garden.findMany({
      where: { userId, period: "WEEK" },
      orderBy: { periodKey: "asc" },
    });

    console.log("[DEV] WEEK gardens AFTER BACKFILL:", userId, weeklyGardens);

    return res.json({ ok: true, count: weeklyGardens.length });
  } catch (err) {
    console.error("[DEV] Error in /backfill-weekly-gardens:", err);
    return res.status(500).json({
      error: "Error backfilling weekly gardens",
      details: err instanceof Error ? err.message : String(err),
    });
  }
});
