"use client";

import { useState } from "react";
import { SummaryCards } from "@/components/analytics/SummaryCards";
import { CategoryPieChart } from "@/components/analytics/CategoryPieChart";
import { RecentExpenses } from "@/components/expense/RecentExpenses";
import { ChatExpenseInput } from "@/components/expense/ChatExpenseInput";
import {
  DateRangeFilter,
  getDefaultDateRange,
  type DateRangeValue
} from "@/components/filters/DateRangeFilter";

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState<DateRangeValue>(getDefaultDateRange);

  return (
    <div className="flex flex-col gap-6 lg:gap-8">
      {/* Header */}
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          Track expenses and view analytics.
        </p>
      </header>

      {/* 1. Add expense (chat) - above everything */}
      <section className="rounded-2xl border bg-card p-5 shadow-sm shadow-black/5" aria-label="Add expense">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Quick add
        </h2>
        <ChatExpenseInput />
      </section>

      {/* 2. Summary */}
      <section aria-label="Summary">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Summary
        </h2>
        <SummaryCards />
      </section>

      {/* 3. Date range */}
      <section className="rounded-2xl border bg-card p-5 shadow-sm shadow-black/5" aria-label="Date range">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Date range
        </h2>
        <DateRangeFilter value={dateRange} onChange={setDateRange} />
      </section>

      {/* 4. Analytics & history - two columns */}
      <section className="grid gap-6 lg:grid-cols-2 lg:gap-8" aria-label="Analytics and history">
        <div className="flex flex-col gap-2 rounded-2xl border bg-card p-5 shadow-sm shadow-black/5">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Spending by category
          </h2>
          <CategoryPieChart start={dateRange.start} end={dateRange.end} />
        </div>
        <div className="flex flex-col gap-2 rounded-2xl border bg-card p-5 shadow-sm shadow-black/5">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Recent expenses
          </h2>
          <RecentExpenses start_date={dateRange.start} end_date={dateRange.end} />
        </div>
      </section>
    </div>
  );
}
