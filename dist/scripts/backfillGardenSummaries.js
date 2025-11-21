// apps/api/src/scripts/backfillGardenSummaries.ts
import { PrismaClient } from "@prisma/client";
import { encryptTextForUser } from "../crypto/diaryEncryption.js";
const prisma = new PrismaClient();
async function backfillGardenSummaries() {
    console.log("🔐 Starting garden summaries backfill…");
    const totalGardens = await prisma.garden.count();
    console.log(`Total gardens in DB: ${totalGardens}`);
    const missingCount = await prisma.garden.count({
        where: {
            summary: { not: null },
            OR: [
                { summaryCiphertext: null },
                { summaryIv: null },
                { summaryAuthTag: null },
            ],
        },
    });
    console.log(`Gardens with plaintext summary but missing encryption fields: ${missingCount}`);
    if (missingCount === 0) {
        console.log("Nothing to do. All summaries already encrypted or empty.");
        return;
    }
    const batchSize = 100;
    let processed = 0;
    for (;;) {
        const gardens = await prisma.garden.findMany({
            where: {
                summary: { not: null },
                OR: [
                    { summaryCiphertext: null },
                    { summaryIv: null },
                    { summaryAuthTag: null },
                ],
            },
            take: batchSize,
            orderBy: { createdAt: "asc" },
            select: {
                id: true,
                userId: true,
                summary: true,
            },
        });
        if (gardens.length === 0) {
            console.log("No more gardens to encrypt in this run.");
            break;
        }
        console.log(`Encrypting batch of ${gardens.length} gardens…`);
        for (const garden of gardens) {
            const summary = garden.summary?.trim();
            if (!summary) {
                console.log(`Skipping garden ${garden.id} (empty summary).`);
                continue;
            }
            try {
                const encrypted = await encryptTextForUser(prisma, garden.userId, summary);
                await prisma.garden.update({
                    where: { id: garden.id },
                    data: {
                        // 🔐 only touching crypto fields; leaving plaintext `summary` as-is
                        summaryIv: encrypted.iv,
                        summaryAuthTag: encrypted.authTag,
                        summaryCiphertext: encrypted.ciphertext,
                        summaryKeyVersion: encrypted.keyVersion,
                    },
                });
                processed += 1;
                if (processed % 50 === 0) {
                    console.log(`Encrypted ${processed} garden summaries so far…`);
                }
            }
            catch (err) {
                console.error(`❌ Failed to encrypt summary for garden ${garden.id} (user ${garden.userId}):`, err);
            }
        }
    }
    console.log(`✅ Garden summaries backfill complete. Total encrypted this run: ${processed}.`);
}
backfillGardenSummaries()
    .catch((err) => {
    console.error("💥 Fatal error in garden summaries backfill:", err);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
