/* eslint-disable no-console */
import { PrismaClient } from "@prisma/client";
import { URL } from "url";

const prisma = new PrismaClient();

/**
 * Extract Cloudinary public_id from a delivery URL.
 * Handles:
 * - folders (foo/bar/baz.jpg → foo/bar/baz)
 * - transformation segments after /upload/
 * - optional version segment /v123456789/
 * Works for image/video/raw upload delivery types.
 * Returns null for non-Cloudinary or fetch URLs (image/fetch).
 */
export function extractPublicIdFromUrl(raw: string): string | null {
  try {
    const u = new URL(raw);

    // Accept res.cloudinary.com or any <sub>.cloudinary.com
    if (!/(\.|^)cloudinary\.com$/i.test(u.hostname)) return null;

    // Example path:
    // /<cloud_name>/image/upload/c_fill,w_300/v169999/foo/bar.pic.jpg
    const parts = u.pathname.replace(/^\/+|\/+$/g, "").split("/"); // trim and split

    // Find ".../upload/..."
    let uploadIdx = parts.indexOf("upload");
    if (uploadIdx === -1) {
      // Sometimes it's "<type>/upload", e.g. image/upload, video/upload
      const tIdx = parts.findIndex((p) => p === "image" || p === "video" || p === "raw");
      if (tIdx !== -1 && parts[tIdx + 1] === "upload") uploadIdx = tIdx + 1;
    }
    if (uploadIdx === -1) return null;

    // Everything after 'upload/'
    const tail = parts.slice(uploadIdx + 1);
    if (!tail.length) return null;

    // Skip transformation segments and optional version segment.
    // Heuristic: transform segments tend to contain commas or start with known params (c_, w_, h_, q_, f_, dpr_, g_, e_, ar_, b_, x_, y_, r_, l_)
    let i = 0;
    while (i < tail.length) {
      const seg = tail[i];
      if (/^v\d+$/.test(seg)) {
        i += 1; // skip version and stop skipping transforms
        break;
      }
      if (
        seg.includes(",") ||
        /^(c_|w_|h_|q_|f_|dpr_|g_|e_|ar_|b_|x_|y_|r_|l_)/.test(seg)
      ) {
        i += 1;
        continue;
      }
      // a non-transform segment—assume we've reached public_id path
      break;
    }

    const publicPath = tail.slice(i);
    if (!publicPath.length) return null;

    // Remove only the final extension from the last segment
    const last = publicPath[publicPath.length - 1];
    const withoutExt = last.includes(".") ? last.replace(/\.[^/.]+$/, "") : last;
    publicPath[publicPath.length - 1] = withoutExt;

    const publicId = publicPath.join("/").replace(/^\/+|\/+$/g, "");
    return publicId || null;
  } catch {
    return null;
  }
}

async function main() {
  const batchSize = 500;
  let updated = 0;
  let skipped = 0;

  // Stream through rows that have imageUrl but no publicId
  // Adjust where clause to your schema/logic if needed
  let cursor: string | undefined = undefined;
  while (true) {
    const page = await prisma.garden.findMany({
      where: { imageUrl: { not: null }, publicId: null },
      take: batchSize,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { id: "asc" },
      select: { id: true, imageUrl: true },
    });

    if (page.length === 0) break;

    cursor = page[page.length - 1].id;

    const updates: { id: string; publicId: string }[] = [];
    for (const g of page) {
      const pid = g.imageUrl ? extractPublicIdFromUrl(g.imageUrl) : null;
      if (pid) updates.push({ id: g.id, publicId: pid });
      else skipped++;
    }

    if (updates.length) {
      // Bulk update
      await prisma.$transaction(
        updates.map((u) =>
          prisma.garden.update({ where: { id: u.id }, data: { publicId: u.publicId } })
        )
      );
      updated += updates.length;
      console.log(`Updated ${updates.length} (total ${updated})`);
    }
  }

  console.log(`Done. Updated: ${updated}, Skipped: ${skipped}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
