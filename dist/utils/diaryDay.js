import { DateTime } from "luxon";
export function computeDiaryDayKey(timezone, rolloverHour, now) {
    const safeRollover = Math.min(23, Math.max(0, Math.floor(rolloverHour)));
    let localNow = (now ? DateTime.fromJSDate(now) : DateTime.now()).setZone(timezone);
    if (!localNow.isValid) {
        localNow = (now ? DateTime.fromJSDate(now) : DateTime.now()).setZone("UTC");
    }
    const effective = localNow.hour < safeRollover ? localNow.minus({ days: 1 }) : localNow;
    if (!effective.isValid) {
        throw new Error("Could not compute valid diary day key");
    }
    // `!` is safe here because we just checked
    return effective.toISODate();
}
// ISO week helper: given a UTC date, returns { weekYear, weekNumber }
function getIsoWeek(year, month, day) {
    // JS months are 0-based, days are 1-based
    const date = new Date(Date.UTC(year, month - 1, day));
    // ISO week: Monday = 0, Sunday = 6
    const dayNr = (date.getUTCDay() + 6) % 7;
    // Move to Thursday of this week (ISO weeks are based on Thursdays)
    const thursday = new Date(date);
    thursday.setUTCDate(thursday.getUTCDate() - dayNr + 3);
    const weekYear = thursday.getUTCFullYear();
    // First Thursday of ISO year
    const firstThursday = new Date(Date.UTC(weekYear, 0, 4));
    const firstThursdayDayNr = (firstThursday.getUTCDay() + 6) % 7;
    firstThursday.setUTCDate(firstThursday.getUTCDate() - firstThursdayDayNr + 3);
    const weekNumber = 1 +
        Math.round((thursday.getTime() - firstThursday.getTime()) / (7 * 24 * 60 * 60 * 1000));
    return { weekYear, weekNumber };
}
export function computePeriodKeysFromDiaryContext(timezone, rolloverHour, now) {
    // 1) What diary day is "today" for this user?
    const dayKey = computeDiaryDayKey(timezone, rolloverHour, now); // "YYYY-MM-DD"
    // 2) Parse the dayKey manually
    const [yStr, mStr, dStr] = dayKey.split("-");
    const year = parseInt(yStr, 10);
    const month = parseInt(mStr, 10);
    const day = parseInt(dStr, 10);
    if (!Number.isFinite(year) ||
        !Number.isFinite(month) ||
        !Number.isFinite(day)) {
        throw new Error(`Invalid dayKey format: ${dayKey}`);
    }
    // 3) WEEK KEY — ISO week year + week number
    const { weekYear, weekNumber } = getIsoWeek(year, month, day);
    const weekKey = `${weekYear}-W${String(weekNumber).padStart(2, "0")}`; // e.g. "2025-W07"
    // 4) MONTH KEY
    const monthKey = `${year}-${String(month).padStart(2, "0")}`; // "2025-02"
    // 5) YEAR KEY
    const yearKey = String(year); // "2025"
    return { dayKey, weekKey, monthKey, yearKey };
}
