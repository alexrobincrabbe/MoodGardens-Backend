// src/kms.ts
import { KMSClient, GenerateDataKeyCommand, DecryptCommand, } from "@aws-sdk/client-kms";
/**
 * Fail fast if required env vars are missing.
 */
function mustGetEnv(name) {
    const v = process.env[name];
    if (!v)
        throw new Error(`Missing required env var: ${name}`);
    return v;
}
export const AWS_REGION = mustGetEnv("AWS_REGION");
export const KMS_KEY_ID = mustGetEnv("KMS_KEY_ID"); // e.g. arn:aws:kms:eu-central-1:...:key/uuid
export const ENCRYPTION_CONTEXT_KEY = "userId"; // we bind keys to a userId context
export const kms = new KMSClient({ region: AWS_REGION });
/**
 * Generate a fresh per-user DEK (Data Encryption Key) using envelope encryption.
 * - Returns the plaintext DEK (Buffer) for immediate use (keep only in memory),
 *   and the EDEK (KMS-encrypted DEK) to persist in DB.
 */
export async function generateUserDEK(userId) {
    const cmd = new GenerateDataKeyCommand({
        KeyId: KMS_KEY_ID,
        KeySpec: "AES_256",
        EncryptionContext: { [ENCRYPTION_CONTEXT_KEY]: userId },
    });
    const resp = await kms.send(cmd);
    if (!resp.Plaintext || !resp.CiphertextBlob || !resp.KeyId) {
        throw new Error("KMS GenerateDataKey returned incomplete response");
    }
    const plaintextKey = Buffer.from(resp.Plaintext); // 32 bytes
    const edek = Buffer.from(resp.CiphertextBlob); // opaque blob
    const keyId = resp.KeyId;
    return { plaintextKey, edek, keyId };
}
/**
 * Decrypt a stored EDEK back to a plaintext DEK (Buffer) for use in a request.
 * Only succeeds if the same EncryptionContext is provided.
 */
export async function decryptEDEK(edek, userId, keyId) {
    const resp = await kms.send(new DecryptCommand({
        CiphertextBlob: edek,
        // KeyId is optional but helps pin the CMK and can speed up decryption.
        KeyId: keyId,
        EncryptionContext: { [ENCRYPTION_CONTEXT_KEY]: userId },
    }));
    if (!resp.Plaintext)
        throw new Error("KMS Decrypt returned no plaintext");
    return Buffer.from(resp.Plaintext);
}
