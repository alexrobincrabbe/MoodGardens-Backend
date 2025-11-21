// src/crypto/diaryEncryption.ts
import crypto from "crypto";
import type { PrismaClient, DiaryEntry } from "@prisma/client";
import { generateUserDEK, decryptEDEK } from "../keyvault.js";

type UserDEK = {
  key: Buffer; // 32-byte AES-256 key
  version: number;
  keyId: string;
};

export async function getOrCreateUserDEK(
  prisma: PrismaClient,
  userId: string
): Promise<UserDEK> {
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

export function encryptTextWithDEK(plaintext: string, dek: Buffer) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", dek, iv);
  const ciphertext = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  return { iv, authTag, ciphertext };
}

export function decryptTextWithDEK(
  ciphertext: Buffer,
  iv: Buffer,
  authTag: Buffer,
  dek: Buffer
): string {
  const decipher = crypto.createDecipheriv("aes-256-gcm", dek, iv);
  decipher.setAuthTag(authTag);
  const plaintext = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);
  return plaintext.toString("utf8");
}

// --- generic "text for user" helpers ---

export async function encryptTextForUser(
  prisma: PrismaClient,
  userId: string,
  text: string
) {
  const { key, version } = await getOrCreateUserDEK(prisma, userId);
  const { iv, authTag, ciphertext } = encryptTextWithDEK(text, key);
  return { iv, authTag, ciphertext, keyVersion: version };
}

export async function decryptTextForUser(
  prisma: PrismaClient,
  userId: string,
  payload: {
    iv: Uint8Array | Buffer | null;
    authTag: Uint8Array | Buffer | null;
    ciphertext: Uint8Array | Buffer | null;
  }
): Promise<string | null> {
  const { iv, authTag, ciphertext } = payload;
  if (!iv || !authTag || !ciphertext) return null;

  const { key } = await getOrCreateUserDEK(prisma, userId);
  return decryptTextWithDEK(
    Buffer.from(ciphertext),
    Buffer.from(iv),
    Buffer.from(authTag),
    key
  );
}

// --- diary-specific wrappers (keep existing API) ---

export async function encryptDiaryForUser(
  prisma: PrismaClient,
  userId: string,
  text: string
) {
  return encryptTextForUser(prisma, userId, text);
}

export async function decryptDiaryForUser(
  prisma: PrismaClient,
  userId: string,
  entry: Pick<DiaryEntry, "iv" | "authTag" | "ciphertext">
): Promise<string | null> {
  return decryptTextForUser(prisma, userId, entry);
}
