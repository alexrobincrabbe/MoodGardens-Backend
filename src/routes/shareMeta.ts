import type { Express } from "express";
import type { PrismaClient } from "@prisma/client";
import { APP_ORIGIN } from "../config/settings.js";


/** Mount /share-meta/:shareId (and .json) and normalize the id. */
export function mountShareMeta(app: Express, prisma: PrismaClient) {
    app.get(["/share-meta/:shareId", "/share-meta/:shareId.json"], async (req, res) => {
        const raw = String(req.params.shareId || "");
        const shareId = raw.replace(/\.json$/i, ""); // allow .json suffix

        const garden = await prisma.garden.findUnique({
            where: { shareId },
            select: {
                period: true,
                periodKey: true,
                imageUrl: true,
                summary: true,
                user: {
                    select: { displayName: true }, // only what you need
                },
            },
        });
        if (!garden) return res.status(404).json({ error: "not_found" });
        const owner = (garden.user?.displayName ?? "").trim() || null;

        const baseTitle = `Mood Gardens — ${garden.period} ${garden.periodKey}`;
        const title = owner ? `${owner}’s ${baseTitle}` : baseTitle;
        const desc = garden.summary || "A garden grown from my day.";
        const img = garden.imageUrl || null;
        const viewLink = garden.period === "DAY" ? `${APP_ORIGIN}/today` : `${APP_ORIGIN}/gardens`;

        // Keep public payload minimal (avoid leaking PII)
        res.json({ title, desc, img, period: garden.period, periodKey: garden.periodKey, viewLink });
    });
}
