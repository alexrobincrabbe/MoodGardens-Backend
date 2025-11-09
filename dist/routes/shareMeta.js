import { APP_ORIGIN } from "../config/settings.js";
import { v2 as cloudinary } from "cloudinary";
function formatDayKey(dayKey) {
    const date = new Date(dayKey);
    if (isNaN(date.getTime()))
        return dayKey; // fallback if invalid
    const day = date.getDate();
    const daySuffix = day % 10 === 1 && day !== 11
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
// Build a proper OG image from Cloudinary publicId
function ogFromPublicId(publicId) {
    // 1200x630, auto-crop + auto format/quality
    return cloudinary.url(publicId, {
        secure: true,
        transformation: [
            { width: 630, height: 630, crop: "fill", gravity: "auto" },
            { fetch_format: "auto", quality: "auto" },
        ],
    });
}
/** Mount /share-meta/:shareId (and .json) and normalize the id. */
export function mountShareMeta(app, prisma) {
    app.get(["/share-meta/:shareId", "/share-meta/:shareId.json"], async (req, res) => {
        const raw = String(req.params.shareId || "");
        const shareId = raw.replace(/\.json$/i, ""); // allow .json suffix
        const garden = await prisma.garden.findUnique({
            where: { shareId },
            select: {
                period: true,
                periodKey: true,
                publicId: true, // <— NEW
                imageUrl: true, // legacy fallback
                summary: true,
                user: { select: { displayName: true } },
            },
        });
        if (!garden)
            return res.status(404).json({ error: "not_found" });
        const owner = (garden.user?.displayName ?? "").trim() || null;
        const baseTitle = `Mood Gardens — ${garden.period} ${garden.periodKey}`;
        const title = owner ? `${owner}’s ${baseTitle}` : baseTitle;
        const desc = garden.summary || "A garden grown from my day.";
        const formattedDate = formatDayKey(garden.periodKey);
        // Prefer publicId-built URL; fall back to stored imageUrl
        const img = garden.publicId ? ogFromPublicId(garden.publicId) : garden.imageUrl || null;
        const viewLink = garden.period === "DAY" ? `${APP_ORIGIN}/today` : `${APP_ORIGIN}/gardens`;
        // Minimal payload for your frontend/SSR or any consumers
        res.json({ owner, title, desc, img, period: garden.period, periodKey: garden.periodKey, formattedDate, viewLink });
    });
}
