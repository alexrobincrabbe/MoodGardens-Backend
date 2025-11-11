// scripts/shiftDates.js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function shiftDates(email) {
  console.log(`Shifting entries and gardens back by one day for: ${email}`);

  try {
    await prisma.$transaction([
      // 1) Shift entries back by one day (simple)
      prisma.$executeRaw`
        UPDATE "Entry" e
        SET "dayKey" = to_char((e."dayKey"::date - INTERVAL '1 day'), 'YYYY-MM-DD')
        FROM "User" u
        WHERE e."userId" = u.id
          AND u.email = ${email};
      `,

      // 2) Gardens phase 1: move to far past (parking lot)
      prisma.$executeRaw`
        UPDATE "Garden" g
        SET "periodKey" = to_char(
          (g."periodKey"::date - INTERVAL '1 day' - INTERVAL '10000 days'),
          'YYYY-MM-DD'
        )
        FROM "User" u
        WHERE g."userId" = u.id
          AND u.email = ${email}
          AND g."period" = 'DAY';
      `,

      // 3) Gardens phase 2: move forward 10000 days (net effect: -1 day)
      prisma.$executeRaw`
        UPDATE "Garden" g
        SET "periodKey" = to_char(
          (g."periodKey"::date + INTERVAL '10000 days'),
          'YYYY-MM-DD'
        )
        FROM "User" u
        WHERE g."userId" = u.id
          AND u.email = ${email}
          AND g."period" = 'DAY';
      `,
    ]);

    console.log("✅ Done! All entries and gardens shifted back by one day.");
  } catch (err) {
    console.error("❌ Error running updates:", err);
  } finally {
    await prisma.$disconnect();
  }
}

const email = process.argv[2];
if (!email) {
  console.error("Usage: node scripts/shiftDates.js user@example.com");
  process.exit(1);
}

shiftDates(email).catch((e) => {
  console.error("❌ Top-level error:", e);
  process.exit(1);
});
