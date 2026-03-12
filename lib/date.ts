import { addDays, endOfDay, endOfMonth, startOfDay, startOfMonth, subDays } from "date-fns";

export type PresetRange = "today" | "last7" | "thisMonth" | "lastMonth" | "custom";

export interface DateRange {
  start: Date;
  end: Date;
}

export function getPresetRange(preset: PresetRange): DateRange {
  const now = new Date();

  switch (preset) {
    case "today":
      return { start: startOfDay(now), end: endOfDay(now) };
    case "last7":
      return { start: startOfDay(subDays(now, 6)), end: endOfDay(now) };
    case "thisMonth":
      return { start: startOfMonth(now), end: endOfMonth(now) };
    case "lastMonth": {
      const lastMonthEnd = startOfMonth(now);
      const lastMonthStart = startOfMonth(addDays(lastMonthEnd, -1));
      return { start: lastMonthStart, end: endOfDay(addDays(lastMonthEnd, -1)) };
    }
    case "custom":
      return { start: startOfDay(now), end: endOfDay(now) };
    default:
      return { start: startOfDay(now), end: endOfDay(now) };
  }
}

export function parseDateParam(value?: string | null): Date | undefined {
  if (!value) return undefined;
  const v = value.trim();

  // If a date-only string is passed (e.g. "2026-03-12"), interpret it in local time.
  // `new Date("YYYY-MM-DD")` is parsed as UTC, which can shift ranges and exclude the intended day.
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v);
  if (dateOnly) {
    const y = Number(dateOnly[1]);
    const m = Number(dateOnly[2]);
    const d = Number(dateOnly[3]);
    const local = new Date(y, m - 1, d);
    if (Number.isNaN(local.getTime())) return undefined;
    return local;
  }

  const parsed = new Date(v);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed;
}

export function toStartOfDay(date: Date) {
  return startOfDay(date);
}

export function toEndOfDay(date: Date) {
  return endOfDay(date);
}

