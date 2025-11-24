// src/keyvault.ts
import crypto from "crypto";
import { ClientSecretCredential } from "@azure/identity";
import { KeyClient, CryptographyClient, } from "@azure/keyvault-keys";
function mustGetEnv(name) {
    const v = process.env[name];
    if (!v)
        throw new Error(`Missing required env var: ${name}`);
    return v;
}
// e.g. "https://<your-vault-name>.vault.azure.net"
const KEY_VAULT_URL = mustGetEnv("AZURE_KEY_VAULT_URL");
// Name of your RSA key in the vault, e.g. "diary-key"
const KEY_VAULT_KEY_NAME = mustGetEnv("KEY_VAULT_KEY_NAME");
// 🔐 service principal creds (same ones you put on Heroku)
const AZURE_TENANT_ID = mustGetEnv("AZURE_TENANT_ID");
const AZURE_CLIENT_ID = mustGetEnv("AZURE_CLIENT_ID");
const AZURE_CLIENT_SECRET = mustGetEnv("AZURE_CLIENT_SECRET");
const credential = new ClientSecretCredential(AZURE_TENANT_ID, AZURE_CLIENT_ID, AZURE_CLIENT_SECRET);
let cachedCrypto = null;
async function getCryptoClient() {
    if (cachedCrypto)
        return cachedCrypto;
    const keyClient = new KeyClient(KEY_VAULT_URL, credential);
    const key = await keyClient.getKey(KEY_VAULT_KEY_NAME); // latest version
    if (!key.id)
        throw new Error("Key Vault key has no id");
    const client = new CryptographyClient(key.id, credential);
    cachedCrypto = { client, keyId: key.id };
    return cachedCrypto;
}
export async function generateUserDEK(userId) {
    const { client, keyId } = await getCryptoClient();
    const dek = crypto.randomBytes(32); // AES-256 DEK
    const wrapped = await client.wrapKey("RSA-OAEP-256", dek);
    return {
        plaintextKey: dek,
        edek: Buffer.from(wrapped.result),
        keyId,
    };
}
export async function decryptEDEK(edek) {
    const { client } = await getCryptoClient();
    const unwrapped = await client.unwrapKey("RSA-OAEP-256", edek);
    return Buffer.from(unwrapped.result);
}
