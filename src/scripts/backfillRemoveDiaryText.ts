import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function removePlaintext() {
  console.log("🧹 Starting plaintext diary text removal…");

  const countEligible = await prisma.diaryEntry.count({
    where: {
      text: { not: "" },
      iv: { not: null },
      authTag: { not: null },
      ciphertext: { not: null },
    },
  });

  console.log(`Found ${countEligible} entries eligible for removal.`);

  if (countEligible === 0) {
    console.log("Nothing to do — all plaintext already removed.");
    return;
  }

  const batchSize = 100;
  let processed = 0;

  for (;;) {
    const entries = await prisma.diaryEntry.findMany({
      where: {
        text: { not: "" },
        iv: { not: null },
        authTag: { not: null },
        ciphertext: { not: null },
      },
      take: batchSize,
      select: { id: true },
    });

    if (entries.length === 0) break;

    console.log(`Processing batch of ${entries.length}…`);

    const ids = entries.map((e) => e.id);

    await prisma.diaryEntry.updateMany({
      where: { id: { in: ids } },
      data: { text: "" }, // leave empty to satisfy GraphQL `String!`
    });

    processed += entries.length;
    console.log(`✔ Wiped ${processed} entries so far…`);
  }

  console.log(`🎉 Done! Total plaintext removed: ${processed}.`);
}

removePlaintext()
  .catch((err) => {
    console.error("💥 ERROR during plaintext removal:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
