import crypto from "crypto";
import { PUBLIC_ORIGIN, joinOrigin } from "../config/settings.js";

export function generateShareId() {
  return crypto.randomBytes(8).toString("hex"); 
}

export function shareUrlFor(id: string) {
  return joinOrigin(PUBLIC_ORIGIN, `share/${id}`);
}

export function mapGardenOut(garden: any) {
  if (!garden) return null;
  return {
    ...garden,
    shareUrl: garden.shareId ? shareUrlFor(garden.shareId) : null,
  };
}
