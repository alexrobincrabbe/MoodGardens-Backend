import { requireUser } from "../lib/auth/auth.js";
import { computeDiaryDayKey } from "../utils/diaryDay.js";
// 🔐 Azure-based encryption helpers
import { encryptDiaryForUser, decryptDiaryForUser, } from "../crypto/diaryEncryption.js";
// QUERIES
//-----------------------------------------------------------------------------------------
export function createDairyEntryQuery(prisma) {
    return async (_, args, ctx) => {
        const userId = requireUser(ctx);
        const entry = await prisma.diaryEntry.findUnique({
            where: { userId_dayKey: { userId, dayKey: args.dayKey } },
            select: {
                id: true,
                text: true, // legacy/plaintext fallback
                dayKey: true,
                createdAt: true,
                iv: true,
                authTag: true,
                ciphertext: true,
                keyVersion: true,
            },
        });
        if (!entry)
            return null;
        // Try to decrypt; if this is an old entry with no ciphertext, fall back to `text`
        const decrypted = await decryptDiaryForUser(prisma, userId, entry);
        return {
            ...entry,
            text: decrypted ?? entry.text,
        };
    };
}
export function createPaginatedEntriesQuery(prisma) {
    return async (_, args, ctx) => {
        const userId = requireUser(ctx);
        const entries = await prisma.diaryEntry.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            take: Math.min(100, Math.max(1, args.limit)),
            skip: Math.max(0, args.offset),
            select: {
                id: true,
                text: true, // legacy/plaintext fallback
                dayKey: true,
                createdAt: true,
                iv: true,
                authTag: true,
                ciphertext: true,
                keyVersion: true,
            },
        });
        // Decrypt each entry; if no ciphertext, keep plaintext text
        const decryptedEntries = await Promise.all(entries.map(async (entry) => {
            const decrypted = await decryptDiaryForUser(prisma, userId, entry);
            return {
                ...entry,
                text: decrypted ?? entry.text,
            };
        }));
        return decryptedEntries;
    };
}
export function createCurrentDayKeyQuery(prisma) {
    return async (_, __, ctx) => {
        const userId = requireUser(ctx);
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { timezone: true, dayRolloverHour: true },
        });
        if (!user)
            throw new Error("User not found");
        return computeDiaryDayKey(user.timezone ?? "UTC", user.dayRolloverHour ?? 0);
    };
}
// MUTATIONS
//--------------------------------------------------------------------------------
export function createCreateDiaryEntryMutation(prisma) {
    return async (_, args, ctx) => {
        const userId = requireUser(ctx);
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { timezone: true, dayRolloverHour: true },
        });
        if (!user) {
            throw new Error("User not found");
        }
        const dayKey = computeDiaryDayKey(user.timezone ?? "UTC", user.dayRolloverHour ?? 0);
        // 🔐 Encrypt the text for this user
        const encrypted = await encryptDiaryForUser(prisma, userId, args.text);
        const diaryEntry = await prisma.diaryEntry.create({
            data: {
                userId,
                dayKey,
                // you can keep plaintext for now if you want an easier migration:
                // text: args.text,
                text: "", // or "" if you want to avoid storing plaintext
                ...encrypted, // iv, authTag, ciphertext, keyVersion
            },
            select: {
                id: true,
                dayKey: true,
                createdAt: true,
                text: true,
                iv: true,
                authTag: true,
                ciphertext: true,
                keyVersion: true,
            },
        });
        // Decrypt before returning, so GraphQL always exposes `text` as plaintext
        const decrypted = await decryptDiaryForUser(prisma, userId, diaryEntry);
        return {
            ...diaryEntry,
            text: decrypted ?? args.text,
        };
    };
}
