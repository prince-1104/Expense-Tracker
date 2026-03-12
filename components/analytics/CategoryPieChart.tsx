"use client";

import { useExpenseSummary } from "@/hooks/useExpenses";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const COLORS = ["#3b82f6", "#22c55e", "#eab308", "#ef4444", "#8b5cf6", "#ec4899"];

interface CategoryPieChartProps {
  start?: string;
  end?: string;
}

export function CategoryPieChart({ start, end }: CategoryPieChartProps) {
  const { data, isLoading, error } = useExpenseSummary({ start, end });

  if (isLoading) {
    return (
      <div className="rounded-lg border bg-card p-4">
        <h2 className="mb-3 text-lg font-semibold">Spending by category</h2>
        <div className="flex h-[280px] items-center justify-center text-muted-foreground text-sm">
          Loading...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border bg-card p-4">
        <h2 className="mb-3 text-lg font-semibold">Spending by category</h2>
        <p className="text-destructive text-sm">Failed to load chart data.</p>
      </div>
    );
  }

  const breakdown = data?.category_breakdown ?? [];
  const chartData = breakdown.map((row, i) => ({
    name: row.category.charAt(0).toUpperCase() + row.category.slice(1),
    value: row.total,
    fill: COLORS[i % COLORS.length]
  }));

  if (chartData.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-4">
        <h2 className="mb-3 text-lg font-semibold">Spending by category</h2>
        <div className="flex h-[280px] items-center justify-center text-muted-foreground text-sm">
          No data for this period
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card p-4">
      <h2 className="mb-3 text-lg font-semibold">Spending by category</h2>
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
              nameKey="name"
            >
              {chartData.map((_, index) => (
                <Cell key={index} fill={chartData[index].fill} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
