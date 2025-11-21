// src/scripts/backfillDiaryEncryption.ts
import { PrismaClient } from "@prisma/client";
import { encryptDiaryForUser } from "../crypto/diaryEncryption.js";
const prisma = new PrismaClient();
async function backfillDiaryEncryption() {
    const batchSize = 100;
    let processed = 0;
    // We repeatedly fetch entries that have no ciphertext yet.
    // This avoids pagination issues while we’re updating in-place.
    // You can extend the `where` if you want stricter checks.
    for (;;) {
        const entries = await prisma.diaryEntry.findMany({
            where: {
                OR: [
                    { ciphertext: null },
                    { iv: null },
                    { authTag: null },
                ],
            },
            take: batchSize,
            orderBy: { createdAt: "asc" },
            select: {
                id: true,
                userId: true,
                text: true,
            },
        });
        if (entries.length === 0) {
            console.log("No more entries to encrypt.");
            break;
        }
        console.log(`Found ${entries.length} entries to encrypt...`);
        for (const entry of entries) {
            // If text is null/empty, skip (nothing to encrypt)
            if (!entry.text) {
                console.log(`Skipping entry ${entry.id} (no text).`);
                continue;
            }
            try {
                const encrypted = await encryptDiaryForUser(prisma, entry.userId, entry.text);
                await prisma.diaryEntry.update({
                    where: { id: entry.id },
                    data: {
                        // 🔐 Write crypto fields, but DO NOT touch `text` yet
                        iv: encrypted.iv,
                        authTag: encrypted.authTag,
                        ciphertext: encrypted.ciphertext,
                        keyVersion: encrypted.keyVersion,
                    },
                });
                processed += 1;
                if (processed % 50 === 0) {
                    console.log(`Encrypted ${processed} entries so far...`);
                }
            }
            catch (err) {
                console.error(`Failed to encrypt entry ${entry.id} for user ${entry.userId}:`, err);
                // You might log this to Sentry/Papertrail later
            }
        }
    }
    console.log(`Done. Total encrypted entries: ${processed}.`);
}
backfillDiaryEncryption()
    .catch((err) => {
    console.error("Fatal error in backfill script:", err);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
