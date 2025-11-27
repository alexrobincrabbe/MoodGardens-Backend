import crypto from "crypto";
import { prisma } from "../../lib/prismaClient.js";

const DEFAULT_TTL_HOURS = Number(process.env.TOKEN_EXPIRES_HOURS || 24);

export type TokenType = "verify-email" | "reset-password";

export async function createTokenForUser(opts: {
  userId: string;
  type: TokenType;
  ttlHours?: number;
}) {
  const { userId, type, ttlHours = DEFAULT_TTL_HOURS } = opts;

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000);

  return prisma.token.create({
    data: {
      userId,
      type,
      token,
      expiresAt,
    },
  });
}

export async function consumeToken(token: string, type: TokenType) {
  const now = new Date();

  const record = await prisma.token.findUnique({
    where: { token },
  });

  if (!record) return null;
  if (record.type !== type) return null;
  if (record.usedAt) return null;
  if (record.expiresAt < now) return null;

  await prisma.token.update({
    where: { token },
    data: { usedAt: now },
  });

  return record;
}
