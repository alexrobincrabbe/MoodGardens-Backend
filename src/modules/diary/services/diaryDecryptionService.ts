import { type PrismaClient } from "@prisma/client";
import { decryptDiaryForUser } from "../../../crypto/diaryEncryption.js";
import { logger } from "../../../lib/logger.js";
import type { DiaryEntry } from "@prisma/client";

type DiaryEntryWithCrypto = Pick<
    DiaryEntry,
    "id" | "text" | "dayKey" | "createdAt" | "iv" | "authTag" | "ciphertext"
>;

export class DiaryDecryptionService {
    constructor(private prisma: PrismaClient) {}

    /**
     * Decrypts a diary entry if encrypted, falling back to plaintext
     */
    async decryptDiaryEntryIfNeeded(
        userId: string,
        entry: DiaryEntryWithCrypto
    ): Promise<string> {
        let text = entry.text;

        // If entry has encryption fields, try to decrypt
        if (entry.ciphertext && entry.iv && entry.authTag) {
            try {
                const decrypted = await decryptDiaryForUser(this.prisma, userId, entry);
                if (decrypted) {
                    text = decrypted;
                }
            } catch (err) {
                // Log error but fall back to plaintext
                logger.error(
                    "Diary decryption failed, falling back to plaintext",
                    err,
                    { userId, entryId: entry.id, dayKey: entry.dayKey }
                );
            }
        }

        return text;
    }

    /**
     * Decrypts multiple diary entries
     */
    async decryptDiaryEntriesIfNeeded(
        userId: string,
        entries: DiaryEntryWithCrypto[]
    ): Promise<Array<DiaryEntryWithCrypto & { text: string }>> {
        return Promise.all(
            entries.map(async (entry) => {
                const decryptedText = await this.decryptDiaryEntryIfNeeded(userId, entry);
                return {
                    ...entry,
                    text: decryptedText,
                };
            })
        );
    }
}

