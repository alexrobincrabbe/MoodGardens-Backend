import { DateTime } from "luxon";

export function computeDiaryDayKey(
    timezone: string,
    rolloverHour: number,
    now?: Date
): string {
    const safeRollover = Math.min(23, Math.max(0, Math.floor(rolloverHour)));

    let localNow = (now ? DateTime.fromJSDate(now) : DateTime.now()).setZone(
        timezone
    );

    if (!localNow.isValid) {
        localNow = (now ? DateTime.fromJSDate(now) : DateTime.now()).setZone("UTC");
    }

    const effective =
        localNow.hour < safeRollover ? localNow.minus({ days: 1 }) : localNow;

    if (!effective.isValid) {
        throw new Error("Could not compute valid diary day key");
    }

    // `!` is safe here because we just checked
    return effective.toISODate()!;
}
