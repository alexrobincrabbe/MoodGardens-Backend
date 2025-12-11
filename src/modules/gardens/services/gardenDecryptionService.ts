import { type PrismaClient, type Garden } from "@prisma/client";
import { decryptTextForUser } from "../../../crypto/diaryEncryption.js";
import { logger } from "../../../lib/logger.js";

export class GardenDecryptionService {
    constructor(private prisma: PrismaClient) {}

    /**
     * Decrypts a single garden's summary if encrypted
     */
    async decryptGardenSummaryIfNeeded(
        userId: string,
        garden: Garden | null
    ): Promise<Garden | null> {
        if (!garden) return garden;

        if (
            garden.summaryCiphertext &&
            garden.summaryIv &&
            garden.summaryAuthTag
        ) {
            try {
                const decrypted = await decryptTextForUser(this.prisma, userId, {
                    iv: garden.summaryIv,
                    authTag: garden.summaryAuthTag,
                    ciphertext: garden.summaryCiphertext,
                });

                if (decrypted) {
                    return {
                        ...garden,
                        summary: decrypted,
                    };
                }
        } catch (err) {
            logger.error(
                "Garden summary decryption failed; falling back to plaintext/empty",
                err,
                { gardenId: garden.id, userId }
            );
        }
        }

        return garden;
    }

    /**
     * Decrypts summaries for many gardens
     */
    async decryptGardenSummariesIfNeeded(
        userId: string,
        gardens: Garden[]
    ): Promise<Garden[]> {
        const results = await Promise.all(
            gardens.map((g) => this.decryptGardenSummaryIfNeeded(userId, g)),
        );
        return results.filter((g): g is Garden => g !== null);
    }
}

