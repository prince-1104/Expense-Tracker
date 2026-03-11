import { addDays, endOfDay, endOfMonth, startOfDay, startOfMonth, subDays } from "date-fns";

export type PresetRange = "today" | "last7" | "thisMonth" | "lastMonth";

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
    default:
      return { start: startOfDay(now), end: endOfDay(now) };
  }
}

export function parseDateParam(value?: string | null): Date | undefined {
  if (!value) return undefined;
  const parsed = new Date(value);
  // invalid date check
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed;
}

