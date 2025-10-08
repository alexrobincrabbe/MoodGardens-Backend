/* eslint-disable no-console */
import { PrismaClient } from "@prisma/client";
import { v2 as cloudinary } from "cloudinary";

const prisma = new PrismaClient();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

async function main() {
  const items = await prisma.garden.findMany({
    where: { publicId: { not: null } },
    select: { id: true, publicId: true },
  });

  let ok = 0, missing = 0;
  for (const g of items) {
    try {
      await cloudinary.api.resource(g.publicId!); // throws if not found
      ok++;
    } catch {
      missing++;
      console.warn("NOT FOUND:", g.id, g.publicId);
    }
  }
  console.log({ ok, missing });
}

main().finally(() => prisma.$disconnect());
