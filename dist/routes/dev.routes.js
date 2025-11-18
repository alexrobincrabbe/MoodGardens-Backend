// src/routes/dev.routes.ts
import { Router } from "express";
import { prisma } from "../prismaClient.js";
import { createWeeklyGardenIfNeeded } from "../services/weeklyAggregation.js";
export const devRouter = Router();
devRouter.post("/test-weekly-garden", async (req, res) => {
    try {
        const userId = req.body.userId;
        console.log("[DEV] Running weekly test for user:", userId);
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
        const weeklyGardensBefore = await prisma.garden.findMany({
            where: {
                userId,
                period: "WEEK",
            },
            orderBy: { periodKey: "asc" },
        });
        console.log("[DEV] Existing WEEK gardens for user:", userId, weeklyGardensBefore);
        await createWeeklyGardenIfNeeded(user);
        const weeklyGardensAfter = await prisma.garden.findMany({
            where: {
                userId,
                period: "WEEK",
            },
            orderBy: { periodKey: "asc" },
        });
        console.log("[DEV] WEEK gardens after aggregation:", userId, weeklyGardensAfter);
        return res.json({ ok: true });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({
            error: "Error generating weekly garden",
            details: err instanceof Error ? err.message : String(err),
        });
    }
});
