// src/keyvault.ts
import crypto from "crypto";
import { DefaultAzureCredential, ClientSecretCredential } from "@azure/identity";
import {
  KeyClient,
  CryptographyClient,
  KeyWrapAlgorithm,
} from "@azure/keyvault-keys";

function mustGetEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

const KEY_VAULT_URL = mustGetEnv("AZURE_KEY_VAULT_URL");
const KEY_VAULT_KEY_NAME = mustGetEnv("KEY_VAULT_KEY_NAME");

function createCredential() {
  const tenantId = process.env.AZURE_TENANT_ID;
  const clientId = process.env.AZURE_CLIENT_ID;
  const clientSecret = process.env.AZURE_CLIENT_SECRET;

  if (tenantId && clientId && clientSecret) {
    // 👇 For Heroku / any server with explicit credentials
    return new ClientSecretCredential(tenantId, clientId, clientSecret);
  }

  // 👇 For local dev, fall back to DefaultAzureCredential (VS Code / CLI / etc.)
  return new DefaultAzureCredential();
}

const credential = createCredential();

let cachedCrypto: { client: CryptographyClient; keyId: string } | null = null;

async function getCryptoClient(): Promise<{ client: CryptographyClient; keyId: string }> {
  if (cachedCrypto) return cachedCrypto;

  const keyClient = new KeyClient(KEY_VAULT_URL, credential);
  const key = await keyClient.getKey(KEY_VAULT_KEY_NAME);
  if (!key.id) throw new Error("Key Vault key has no id");
  const client = new CryptographyClient(key.id, credential);

  cachedCrypto = { client, keyId: key.id };
  return cachedCrypto;
}

export async function generateUserDEK(userId: string) {
  const { client, keyId } = await getCryptoClient();

  const dek = crypto.randomBytes(32);
  const wrapped = await client.wrapKey("RSA-OAEP-256" as KeyWrapAlgorithm, dek);

  return {
    plaintextKey: dek,
    edek: Buffer.from(wrapped.result),
    keyId,
  };
}

export async function decryptEDEK(edek: Uint8Array | Buffer): Promise<Buffer> {
  const { client } = await getCryptoClient();
  const unwrapped = await client.unwrapKey(
    "RSA-OAEP-256" as KeyWrapAlgorithm,
    edek
  );
  return Buffer.from(unwrapped.result);
}
