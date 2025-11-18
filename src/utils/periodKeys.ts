// src/utils/periodKeys.ts
import { DateTime } from "luxon";
import { computeDiaryDayKey } from "./diaryDay.js";

// --- existing code you already have ---
// (adapt import path of computeDiaryDayKey to wherever it lives)

// ISO week helper (same as previously)
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

// Get previous weekKey from current weekKey "YYYY-Www"
export function getPreviousWeekKey(currentWeekKey: string): string {
  const [yearStr, weekPart] = currentWeekKey.split("-W");
  const year = parseInt(yearStr, 10);
  const week = parseInt(weekPart, 10);

  // Convert ISO week to a date (Monday of that week)
  // Then subtract 7 days, then get its week key again.
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

// Monday of ISO week as JS Date (UTC)
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

// From a weekKey, get [startDayKey (Monday), endDayKey (Sunday)]
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
