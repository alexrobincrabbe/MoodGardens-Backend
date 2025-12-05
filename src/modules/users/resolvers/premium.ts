import { requireUser, type Context } from "../lib/auth.js";
import { PrismaClient } from "@prisma/client";

export function createMarkUserPremiumFromMobileMutation(prisma: PrismaClient) {
  return async (_: unknown, __: unknown, ctx: Context) => {
    const userId = requireUser(ctx);

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        isPremium: true,
        premiumSince: new Date(),
      },
      select: {
        id: true,
        email: true,
        displayName: true,
        isPremium: true,
        premiumSince: true,
        regenerateTokens: true,
      },
    });

    return user;
  };
}

export function createAddRegenTokensFromMobileMutation(prisma: PrismaClient) {
  return async (_: unknown, args: { amount: number }, ctx: Context) => {
    const userId = requireUser(ctx);
    const amount = Math.max(0, Math.min(args.amount ?? 0, 100)); // simple safety

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        regenerateTokens: {
          increment: amount,
        },
      },
      select: {
        id: true,
        email: true,
        displayName: true,
        isPremium: true,
        premiumSince: true,
        regenerateTokens: true,
      },
    });

    return user;
  };
}
