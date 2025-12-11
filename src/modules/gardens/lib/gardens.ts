import crypto from "crypto";
import { APP_ORIGIN } from "../../../config/settings.js";

export function shareUrlFor(shareId: string | null | undefined) {
  if (!shareId) return null;
  return `${APP_ORIGIN}/share/${shareId}`;
}

export function generateShareId() {
  return crypto.randomBytes(8).toString("hex"); 
}

import { type Garden } from "@prisma/client";

export function mapGardenOut(garden: Garden | null) {
  if (!garden) return null;
  return {
    ...garden,
    shareUrl: shareUrlFor(garden.shareId),
    version: garden.version,
  };
}