import { DateTime } from "luxon";
import { computeDiaryDayKey } from "../../diary/utils/diaryDayKey.js";


function getIsoWeek(year: number, month: number, day: number) {
  const date = new Date(Date.UTC(year, month - 1, day));
  const dayNr = (date.getUTCDay() + 6) % 7;

  const thursday = new Date(date);
  thursday.setUTCDate(thursday.getUTCDate() - dayNr + 3);

  const weekYear = thursday.getUTCFullYear();

  const firstThursday = new Date(Date.UTC(weekYear, 0, 4));
  const firstThursdayDayNr = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(
    firstThursday.getUTCDate() - firstThursdayDayNr + 3
  );

  const weekNumber =
    1 +
    Math.round(
      (thursday.getTime() - firstThursday.getTime()) /
        (7 * 24 * 60 * 60 * 1000)
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
  const weekKey = `${weekYear}-W${String(weekNumber).padStart(2, "0")}`;
  const monthKey = `${year}-${String(month).padStart(2, "0")}`;
  const yearKey = String(year);

  return { dayKey, weekKey, monthKey, yearKey };
}

export function getPreviousWeekKey(currentWeekKey: string): string {
  const [yearStr, weekPart] = currentWeekKey.split("-W");
  const year = parseInt(yearStr, 10);
  const week = parseInt(weekPart, 10);
  const monday = isoWeekToDate(year, week);
  const prevMonday = new Date(monday);
  prevMonday.setUTCDate(prevMonday.getUTCDate() - 7);
  const [py, pm, pd] = [
    prevMonday.getUTCFullYear(),
    prevMonday.getUTCMonth() + 1,
    prevMonday.getUTCDate(),
  ];
  const { weekYear, weekNumber } = getIsoWeek(py, pm, pd);
  return `${weekYear}-W${String(weekNumber).padStart(2, "0")}`;
}

function isoWeekToDate(weekYear: number, weekNumber: number): Date {
  // ISO week 1 is the week with Jan 4th in it
  const simple = new Date(Date.UTC(weekYear, 0, 4));
  const dayOfWeek = simple.getUTCDay() || 7; // Sunday -> 7

  const mondayOfWeek1 = new Date(simple);
  mondayOfWeek1.setUTCDate(simple.getUTCDate() - dayOfWeek + 1);

  const mondayOfTarget = new Date(mondayOfWeek1);
  mondayOfTarget.setUTCDate(mondayOfWeek1.getUTCDate() + (weekNumber - 1) * 7);

  return mondayOfTarget;
}

export function getWeekRangeFromWeekKey(weekKey: string): {
  startDayKey: string;
  endDayKey: string;
} {
  const [yearStr, weekPart] = weekKey.split("-W");
  const weekYear = parseInt(yearStr, 10);
  const weekNumber = parseInt(weekPart, 10);

  const monday = isoWeekToDate(weekYear, weekNumber);
  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);

  const toDayKey = (d: Date) =>
    new Date(d.getTime()).toISOString().slice(0, 10); // "YYYY-MM-DD"

  return {
    startDayKey: toDayKey(monday),
    endDayKey: toDayKey(sunday),
  };
}

export function getPreviousMonthKey(currentMonthKey: string): string {
  // currentMonthKey format: "YYYY-MM"
  const [yStr, mStr] = currentMonthKey.split("-");
  const year = parseInt(yStr, 10);
  const month = parseInt(mStr, 10);

  if (month > 1) {
    const prevMonth = String(month - 1).padStart(2, "0");
    return `${year}-${prevMonth}`;
  } else {
    // going from January -> December of previous year
    return `${year - 1}-12`;
  }
}

export function getPreviousYearKey(currentYearKey: string): string {
  // currentYearKey format: "YYYY"
  const year = parseInt(currentYearKey, 10);
  return String(year - 1);
}

export function weekBelongsToMonth(weekKey: string, monthKey: string): boolean {
  // monthKey: "YYYY-MM"
  const { startDayKey } = getWeekRangeFromWeekKey(weekKey);
  // startDayKey: "YYYY-MM-DD"
  const [yStr, mStr] = startDayKey.split("-");
  const monthFromWeek = `${yStr}-${mStr}`;
  return monthFromWeek === monthKey;
}

export function weekKeyFromDayKey(dayKey: string): string {
const dt = (DateTime as any).fromISO(dayKey, { zone: "UTC" });
  if (!dt.isValid) {
    throw new Error(`Invalid dayKey for weekKeyFromDayKey: ${dayKey}`);
  }

  const anyDt = dt as any;
  const weekYear: number = anyDt.weekYear;
  const weekNumber: number = anyDt.weekNumber;

  const weekStr = String(weekNumber).padStart(2, "0");
  return `${weekYear}-W${weekStr}`;
}