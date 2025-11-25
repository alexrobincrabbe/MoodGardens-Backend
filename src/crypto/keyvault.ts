import crypto from "crypto";
import { ClientSecretCredential } from "@azure/identity";
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
const AZURE_TENANT_ID = mustGetEnv("AZURE_TENANT_ID");
const AZURE_CLIENT_ID = mustGetEnv("AZURE_CLIENT_ID");
const AZURE_CLIENT_SECRET = mustGetEnv("AZURE_CLIENT_SECRET");
const credential = new ClientSecretCredential(
  AZURE_TENANT_ID,
  AZURE_CLIENT_ID,
  AZURE_CLIENT_SECRET
);

let cachedCrypto: { client: CryptographyClient; keyId: string } | null = null;

async function getCryptoClient(): Promise<{ client: CryptographyClient; keyId: string }> {
  if (cachedCrypto) return cachedCrypto;
  const keyClient = new KeyClient(KEY_VAULT_URL, credential);
  const key = await keyClient.getKey(KEY_VAULT_KEY_NAME); // latest version
  if (!key.id) throw new Error("Key Vault key has no id");
  const client = new CryptographyClient(key.id, credential);
  cachedCrypto = { client, keyId: key.id };
  return cachedCrypto;
}

export async function generateUserDEK(userId: string) {
  const { client, keyId } = await getCryptoClient();
  const dek = crypto.randomBytes(32); // AES-256 DEK
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
