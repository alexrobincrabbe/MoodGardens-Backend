// apps/api/src/lib/gardens.ts
import crypto from "crypto";
import { PUBLIC_ORIGIN, joinOrigin } from "../config/settings.js";
export function generateShareId() {
    return crypto.randomBytes(8).toString("hex"); // 16 hex chars
}
export function shareUrlFor(id) {
    return joinOrigin(PUBLIC_ORIGIN, `share/${id}`);
}
export function mapGardenOut(garden) {
    if (!garden)
        return null;
    return {
        ...garden,
        palette: garden.palette ? JSON.parse(garden.palette) : null,
        shareUrl: garden.shareId ? shareUrlFor(garden.shareId) : null,
    };
}
