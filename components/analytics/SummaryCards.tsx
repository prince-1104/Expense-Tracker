"use client";

import { useExpenseSummary } from "@/hooks/useExpenses";
import { getPresetRange } from "@/lib/date";
import { format } from "date-fns";

function toYYYYMMDD(d: Date) {
  return format(d, "yyyy-MM-dd");
}

export function SummaryCards() {
  const thisMonthRange = getPresetRange("thisMonth");
  const last7Range = getPresetRange("last7");

  const monthSummary = useExpenseSummary({
    start: toYYYYMMDD(thisMonthRange.start),
    end: toYYYYMMDD(thisMonthRange.end)
  });
  const weekSummary = useExpenseSummary({
    start: toYYYYMMDD(last7Range.start),
    end: toYYYYMMDD(last7Range.end)
  });

  const monthTotal = monthSummary.data?.total_spent ?? 0;
  const weekTotal = weekSummary.data?.total_spent ?? 0;
  const monthCount = monthSummary.data?.transaction_count ?? 0;
  const isLoading = monthSummary.isLoading || weekSummary.isLoading;
  const hasError = monthSummary.isError || weekSummary.isError;

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-muted-foreground text-sm">Total Spent This Month</p>
          <p className="mt-1 text-2xl font-semibold">...</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-muted-foreground text-sm">Total Spent This Week</p>
          <p className="mt-1 text-2xl font-semibold">...</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-muted-foreground text-sm">Total Transactions</p>
          <p className="mt-1 text-2xl font-semibold">...</p>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-card p-4">
        <p className="text-destructive text-sm">Failed to load summary.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="rounded-lg border bg-card p-4">
        <p className="text-muted-foreground text-sm">Total Spent This Month</p>
        <p className="mt-1 text-2xl font-semibold">₹{monthTotal.toLocaleString()}</p>
      </div>
      <div className="rounded-lg border bg-card p-4">
        <p className="text-muted-foreground text-sm">Total Spent This Week</p>
        <p className="mt-1 text-2xl font-semibold">₹{weekTotal.toLocaleString()}</p>
      </div>
      <div className="rounded-lg border bg-card p-4">
        <p className="text-muted-foreground text-sm">Total Transactions</p>
        <p className="mt-1 text-2xl font-semibold">{monthCount}</p>
      </div>
    </div>
  );
}
