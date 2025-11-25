// src/services/weeklyAggregation.ts
import { prisma } from "../../../lib/prismaClient.js";
import {
    computePeriodKeysFromDiaryContext,
    getPreviousWeekKey,
    getWeekRangeFromWeekKey,
    weekKeyFromDayKey,
} from "../../gardens/utils/periodKeys.js";
import { gardenQueue, gardenJobOpts } from "../../../queues/garden.queue.js";
import { summariseWeek } from "./summaries/summariseWeek.js";
import { generateShareId } from "../../gardens/lib/gardens.js";
import { encryptTextForUser } from "../../../crypto/diaryEncryption.js";

const MIN_ENTRIES_PER_WEEK = 5;

type UserLike = {
    id: string;
    timezone: string;
    dayRolloverHour: number;
};

export async function createWeeklyGardenIfNeeded(user: UserLike) {
    const userId = user.id;
    const { weekKey: currentWeekKey } = computePeriodKeysFromDiaryContext(
        user.timezone,
        user.dayRolloverHour
    );
    const lastCompletedWeekKey = getPreviousWeekKey(currentWeekKey);

    const existing = await prisma.garden.findUnique({
        where: {
            userId_period_periodKey: {
                userId,
                period: "WEEK",
                periodKey: lastCompletedWeekKey,
            },
        },
    });

    if (existing) {
        console.log("[WEEKLY]", userId, "garden already exists for", lastCompletedWeekKey, {
            gardenId: existing.id,
            status: existing.status,
        });
        return;
    }

    const { startDayKey, endDayKey } = getWeekRangeFromWeekKey(lastCompletedWeekKey);
    console.log("[WEEKLY]", userId, "week range:", { startDayKey, endDayKey });

    const entries = await prisma.diaryEntry.findMany({
        where: {
            userId,
            dayKey: {
                gte: startDayKey,
                lte: endDayKey,
            },
        },
        orderBy: { dayKey: "asc" },
        select: {
            dayKey: true,
            text: true,
            iv: true,
            authTag: true,
            ciphertext: true,
        },
    });

    if (entries.length < MIN_ENTRIES_PER_WEEK) {
        console.log(
            "[WEEKLY]",
            userId,
            "not enough entries:",
            entries.length,
            "required:",
            MIN_ENTRIES_PER_WEEK
        );
        return;
    }

    console.log("[WEEKLY]", userId, "summarising week…");
    const summary = await summariseWeek(prisma, userId, entries);
    const encryptedSummary = await encryptTextForUser(prisma, userId, summary);

    const garden = await prisma.garden.create({
        data: {
            userId: user.id,
            period: "WEEK",
            periodKey: lastCompletedWeekKey,
            status: "PENDING",
            summary:"",
            summaryIv: encryptedSummary.iv,
            summaryAuthTag: encryptedSummary.authTag,
            summaryCiphertext: encryptedSummary.ciphertext,
            summaryKeyVersion: encryptedSummary.keyVersion,
            progress: 0,
            shareId: generateShareId(),
        },
    });

    console.log(
        "[WEEKLY]",
        userId,
        "created WEEK garden for",
        lastCompletedWeekKey,
        "→",
        garden.id
    );

    await gardenQueue.add(
        "generate",
        {
            gardenId: garden.id,
            period: "WEEK",
            periodKey: lastCompletedWeekKey,
        },
        gardenJobOpts
    );
}


/**
 * ✅ Backfill weekly gardens for all past weeks that
 * have enough entries and no WEEK garden yet.
 */
export async function backfillWeeklyGardensForUser(
    user: UserLike,
    options?: { maxWeeksAgo?: number }
) {
    const userId = user.id;

    const { weekKey: currentWeekKey } = computePeriodKeysFromDiaryContext(
        user.timezone,
        user.dayRolloverHour
    );

    // 1) Fetch all diary entries for this user (with crypto fields)
    const entries = await prisma.diaryEntry.findMany({
        where: { userId },
        orderBy: { dayKey: "asc" },
        select: {
            dayKey: true,
            text: true,
            iv: true,
            authTag: true,
            ciphertext: true,
        },
    });

    if (!entries.length) {
        console.log("[WEEKLY-BACKFILL]", userId, "no diary entries – nothing to backfill");
        return;
    }

    // 2) Group entries by weekKey
    const byWeek = new Map<string, typeof entries>();

    for (const entry of entries) {
        const weekKey = weekKeyFromDayKey(entry.dayKey); // e.g. "2025-W46"

        // skip current or future weeks, only backfill fully completed weeks
        if (weekKey >= currentWeekKey) continue;

        if (!byWeek.has(weekKey)) {
            byWeek.set(weekKey, []);
        }
        byWeek.get(weekKey)!.push(entry);
    }

    // 3) Sort week keys ascending (old → new)
    let weekKeys = Array.from(byWeek.keys()).sort(); // "YYYY-Www" sorts lexicographically

    // Optional: limit how far back to go
    if (options?.maxWeeksAgo && weekKeys.length > options.maxWeeksAgo) {
        weekKeys = weekKeys.slice(-options.maxWeeksAgo);
    }

    console.log(
        "[WEEKLY-BACKFILL]",
        userId,
        "candidate weeks:",
        weekKeys,
        "currentWeekKey:",
        currentWeekKey
    );

    for (const weekKey of weekKeys) {
        const entriesInWeek = byWeek.get(weekKey)!;

        // Check if WEEK garden already exists
        const existing = await prisma.garden.findUnique({
            where: {
                userId_period_periodKey: {
                    userId,
                    period: "WEEK",
                    periodKey: weekKey,
                },
            },
        });

        if (existing) {
            console.log(
                "[WEEKLY-BACKFILL]",
                userId,
                "week already has garden:",
                weekKey,
                "→",
                existing.id,
                existing.status
            );
            continue;
        }

        if (entriesInWeek.length < MIN_ENTRIES_PER_WEEK) {
            console.log(
                "[WEEKLY-BACKFILL]",
                userId,
                "week",
                weekKey,
                "has only",
                entriesInWeek.length,
                "entries (min",
                MIN_ENTRIES_PER_WEEK,
                ") – skipping"
            );
            continue;
        }

            console.log("[WEEKLY-BACKFILL]", userId, "summarising week", weekKey, "…");

    // summarise the entries for THIS week
    const summary = await summariseWeek(prisma, userId, entriesInWeek);

    // 🔐 encrypt weekly summary for storage
    const encryptedSummary = await encryptTextForUser(prisma, userId, summary);

    const weekGarden = await prisma.garden.create({
      data: {
        userId,
        period: "WEEK",
        periodKey: weekKey,
        status: "PENDING",
        summary: "",
        summaryIv: encryptedSummary.iv,
        summaryAuthTag: encryptedSummary.authTag,
        summaryCiphertext: encryptedSummary.ciphertext,
        summaryKeyVersion: encryptedSummary.keyVersion,
        progress: 0,
        shareId: generateShareId(),
      },
    });

        console.log(
            "[WEEKLY-BACKFILL]",
            userId,
            "created WEEK garden:",
            weekKey,
            "→",
            weekGarden.id
        );

        await gardenQueue.add(
            "generate",
            {
                gardenId: weekGarden.id,
                period: "WEEK",
                periodKey: weekKey,
            },
            gardenJobOpts
        );

        console.log(
            "[WEEKLY-BACKFILL]",
            userId,
            "queued generate job for WEEK",
            weekKey
        );
    }

    console.log("[WEEKLY-BACKFILL]", userId, "backfill complete");
}
