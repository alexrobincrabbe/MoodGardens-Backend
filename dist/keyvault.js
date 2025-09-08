// src/keyvault.ts
import crypto from "crypto";
import { DefaultAzureCredential } from "@azure/identity";
import { KeyClient, CryptographyClient, } from "@azure/keyvault-keys";
/**
 * Env helpers
 */
function mustGetEnv(name) {
    const v = process.env[name];
    if (!v)
        throw new Error(`Missing required env var: ${name}`);
    return v;
}
// e.g. "https://<your-vault-name>.vault.azure.net"
const KEY_VAULT_URL = mustGetEnv("AZURE_KEY_VAULT_URL");
// Name of your RSA key stored in Key Vault (e.g., "journal-keK")
const KEY_VAULT_KEY_NAME = mustGetEnv("KEY_VAULT_KEY_NAME");
// Azure credential chain: Managed Identity in Azure, or env vars locally.
const credential = new DefaultAzureCredential();
let cachedCrypto = null;
async function getCryptoClient() {
    if (cachedCrypto)
        return cachedCrypto;
    const keyClient = new KeyClient(KEY_VAULT_URL, credential);
    const key = await keyClient.getKey(KEY_VAULT_KEY_NAME); // loads latest version
    if (!key.id)
        throw new Error("Key Vault key has no id");
    const client = new CryptographyClient(key.id, credential);
    cachedCrypto = { client, keyId: key.id };
    return cachedCrypto;
}
/**
 * Create a fresh per-user DEK (32 bytes) and wrap it with the Key Vault key.
 * Store the returned EDEK in your DB (UserKey.edek) and use plaintextKey only in-memory.
 */
export async function generateUserDEK(userId) {
    const { client, keyId } = await getCryptoClient();
    const dek = crypto.randomBytes(32); // AES-256 content key
    const wrapped = await client.wrapKey("RSA-OAEP-256", dek);
    return {
        plaintextKey: dek,
        edek: Buffer.from(wrapped.result),
        keyId,
    };
}
/**
 * Unwrap a stored EDEK back to a plaintext DEK for this request.
 * (No encryption-context concept in Key Vault; rely on RBAC/auditing.)
 */
export async function decryptEDEK(edek) {
    const { client } = await getCryptoClient();
    const unwrapped = await client.unwrapKey("RSA-OAEP-256", edek);
    return Buffer.from(unwrapped.result);
}
