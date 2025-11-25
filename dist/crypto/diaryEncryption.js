import crypto from "crypto";
import { generateUserDEK, decryptEDEK } from "./keyvault.js";
export async function getOrCreateUserDEK(prisma, userId) {
    const existing = await prisma.userKey.findUnique({
        where: { userId },
    });
    if (existing) {
        const key = await decryptEDEK(existing.edek);
        return { key, version: existing.version, keyId: existing.keyId };
    }
    const { plaintextKey, edek, keyId } = await generateUserDEK(userId);
    const created = await prisma.userKey.create({
        data: {
            userId,
            edek,
            keyId,
            version: 1,
        },
    });
    return { key: plaintextKey, version: created.version, keyId: created.keyId };
}
// --- low-level AES-GCM ---
export function encryptTextWithDEK(plaintext, dek) {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv("aes-256-gcm", dek, iv);
    const ciphertext = Buffer.concat([
        cipher.update(plaintext, "utf8"),
        cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();
    return { iv, authTag, ciphertext };
}
export function decryptTextWithDEK(ciphertext, iv, authTag, dek) {
    const decipher = crypto.createDecipheriv("aes-256-gcm", dek, iv);
    decipher.setAuthTag(authTag);
    const plaintext = Buffer.concat([
        decipher.update(ciphertext),
        decipher.final(),
    ]);
    return plaintext.toString("utf8");
}
// --- generic "text for user" helpers ---
export async function encryptTextForUser(prisma, userId, text) {
    const { key, version } = await getOrCreateUserDEK(prisma, userId);
    const { iv, authTag, ciphertext } = encryptTextWithDEK(text, key);
    return { iv, authTag, ciphertext, keyVersion: version };
}
export async function decryptTextForUser(prisma, userId, payload) {
    const { iv, authTag, ciphertext } = payload;
    if (!iv || !authTag || !ciphertext)
        return null;
    const { key } = await getOrCreateUserDEK(prisma, userId);
    return decryptTextWithDEK(Buffer.from(ciphertext), Buffer.from(iv), Buffer.from(authTag), key);
}
// --- diary-specific wrappers (keep existing API) ---
export async function encryptDiaryForUser(prisma, userId, text) {
    return encryptTextForUser(prisma, userId, text);
}
export async function decryptDiaryForUser(prisma, userId, entry) {
    return decryptTextForUser(prisma, userId, entry);
}
