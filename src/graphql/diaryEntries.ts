import { type PrismaClient } from "@prisma/client";
import { type Context, requireUser } from "../lib/auth/auth.js";
import { computeDiaryDayKey } from "../utils/diaryDay.js";
import { decryptDiaryForUser } from "../crypto/diaryEncryption.js";

type CreateDiaryEntryArgs = { text: string };

// QUERIES
//-----------------------------------------------------------------------------------------
export function createDairyEntryQuery(prisma: PrismaClient) {
  return async (_: unknown, args: { dayKey: string }, ctx: Context) => {
    const userId = requireUser(ctx);

    const entry = await prisma.diaryEntry.findUnique({
      where: { userId_dayKey: { userId, dayKey: args.dayKey } },
      select: {
        id: true,
        text: true,
        dayKey: true,
        createdAt: true,
        iv: true,
        authTag: true,
        ciphertext: true,
      },
    });

    if (!entry) return null;

    let text = entry.text;
    try {
      const decrypted = await decryptDiaryForUser(prisma, userId, entry);
      if (decrypted) text = decrypted;
    } catch (err) {
      console.error(
        "[diaryEntry] decrypt failed, falling back to plaintext",
        { userId, dayKey: args.dayKey },
        err
      );
    }

    return {
      ...entry,
      text,
    };
  };
}

export function createPaginatedEntriesQuery(prisma: PrismaClient) {
  return async (
    _: unknown,
    args: { limit: number; offset: number },
    ctx: Context
  ) => {
    const userId = requireUser(ctx);

    const entries = await prisma.diaryEntry.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: Math.min(100, Math.max(1, args.limit)),
      skip: Math.max(0, args.offset),
      select: {
        id: true,
        text: true,
        dayKey: true,
        createdAt: true,
        iv: true,
        authTag: true,
        ciphertext: true,
      },
    });

    const result = await Promise.all(
      entries.map(async (entry) => {
        let text = entry.text;
        try {
          const decrypted = await decryptDiaryForUser(prisma, userId, entry);
          if (decrypted) text = decrypted;
        } catch (err) {
          console.error(
            "[paginatedDiaryEntries] decrypt failed, falling back to plaintext",
            { userId, entryId: entry.id },
            err
          );
        }

        return {
          ...entry,
          text,
        };
      })
    );

    return result;
  };
}

export function createCurrentDayKeyQuery(prisma: PrismaClient) {
  return async (_: unknown, __: unknown, ctx: Context) => {
    const userId = requireUser(ctx);
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { timezone: true, dayRolloverHour: true },
    });
    if (!user) throw new Error("User not found");
    return computeDiaryDayKey(
      user.timezone ?? "UTC",
      user.dayRolloverHour ?? 0
    );
  };
}

// MUTATIONS (can stay as-is; they don't need decrypt)
export function createCreateDiaryEntryMutation(prisma: PrismaClient) {
  return async (_: unknown, args: CreateDiaryEntryArgs, ctx: Context) => {
    const userId = requireUser(ctx);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { timezone: true, dayRolloverHour: true },
    });

    if (!user) throw new Error("User not found");

    const dayKey = computeDiaryDayKey(
      user.timezone ?? "UTC",
      user.dayRolloverHour ?? 0
    );

    const diaryEntry = await prisma.diaryEntry.create({
      data: { text: args.text, dayKey, userId },
    });

    return diaryEntry;
  };
}
