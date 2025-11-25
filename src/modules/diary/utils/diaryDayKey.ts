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
    return effective.toISODate()!;
}

function getIsoWeek(year: number, month: number, day: number) {
  const date = new Date(Date.UTC(year, month - 1, day));
  const dayNr = (date.getUTCDay() + 6) % 7;
  const thursday = new Date(date);
  thursday.setUTCDate(thursday.getUTCDate() - dayNr + 3);
  const weekYear = thursday.getUTCFullYear();
  const firstThursday = new Date(Date.UTC(weekYear, 0, 4));
  const firstThursdayDayNr = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstThursdayDayNr + 3);
  const weekNumber =
    1 +
    Math.round(
      (thursday.getTime() - firstThursday.getTime()) / (7 * 24 * 60 * 60 * 1000)
    );
  return { weekYear, weekNumber };
}

export function computePeriodKeysFromDiaryContext(
  timezone: string,
  rolloverHour: number,
  now?: Date
) {
  const dayKey = computeDiaryDayKey(timezone, rolloverHour, now); // "YYYY-MM-DD"
  const [yStr, mStr, dStr] = dayKey.split("-");
  const year = parseInt(yStr, 10);
  const month = parseInt(mStr, 10);
  const day = parseInt(dStr, 10);
  if (
    !Number.isFinite(year) ||
    !Number.isFinite(month) ||
    !Number.isFinite(day)
  ) {
    throw new Error(`Invalid dayKey format: ${dayKey}`);
  }
  const { weekYear, weekNumber } = getIsoWeek(year, month, day);
  const weekKey = `${weekYear}-W${String(weekNumber).padStart(2, "0")}`; // e.g. "2025-W07"
  const monthKey = `${year}-${String(month).padStart(2, "0")}`; // "2025-02"
  const yearKey = String(year); // "2025"

  return { dayKey, weekKey, monthKey, yearKey };
}
