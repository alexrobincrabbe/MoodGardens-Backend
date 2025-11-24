import type { Express } from "express";
import type { PrismaClient } from "@prisma/client";
import { APP_ORIGIN } from "../config/settings.js";
import { v2 as cloudinary } from "cloudinary";


function formatDayKey(dayKey: string): string {
  const date = new Date(dayKey);
  if (isNaN(date.getTime())) return dayKey; // fallback if invalid
  const day = date.getDate();
  const daySuffix =
    day % 10 === 1 && day !== 11
      ? "st"
      : day % 10 === 2 && day !== 12
      ? "nd"
      : day % 10 === 3 && day !== 13
      ? "rd"
      : "th";
  const weekday = date.toLocaleDateString("en-GB", { weekday: "long" });
  const month = date.toLocaleDateString("en-GB", { month: "long" });
  const year = date.getFullYear();
  return `${weekday} ${day}${daySuffix} of ${month} ${year}`;
}

function ogFromPublicId(publicId: string) {
  return cloudinary.url(publicId, {
    secure: true,
    transformation: [
      { width: 630, height: 630, crop: "fill", gravity: "auto" },
      { fetch_format: "auto", quality: "auto" },
    ],
  });
}

export function mountShareMeta(app: Express, prisma: PrismaClient) {
  app.get(["/share-meta/:shareId", "/share-meta/:shareId.json"], async (req, res) => {
    const raw = String(req.params.shareId || "");
    const shareId = raw.replace(/\.json$/i, ""); // allow .json suffix

    const garden = await prisma.garden.findUnique({
      where: { shareId },
      select: {
        period: true,
        periodKey: true,
        publicId: true,        // <— NEW
        summary: true,
        user: { select: { displayName: true } },
      },
    });
    if (!garden) return res.status(404).json({ error: "not_found" });
    const formattedDate = formatDayKey(garden.periodKey)
    const owner = (garden.user?.displayName ?? "").trim() || null;
    const baseTitle = `Mood Garden — ${formattedDate}`;
    const title = owner ? `${owner}’s ${baseTitle}` : baseTitle;
    const desc = garden.summary || "A garden grown from my day.";
    const img = garden.publicId ? ogFromPublicId(garden.publicId) : garden.publicId|| null;
    const viewLink = `${APP_ORIGIN}`;
    res.json({ owner, title, desc, img, period: garden.period, periodKey: garden.periodKey, formattedDate, viewLink });
  });
}
