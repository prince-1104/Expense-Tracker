"use client";

import { useState } from "react";
import { useExpenses, useDeleteExpense } from "@/hooks/useExpenses";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RecentExpensesProps {
  start_date?: string;
  end_date?: string;
}

export function RecentExpenses({ start_date, end_date }: RecentExpensesProps) {
  const { data: expenses, isLoading, error } = useExpenses({ start_date, end_date });
  const deleteExpense = useDeleteExpense();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const recent = (expenses ?? []).slice(0, 10);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this expense?")) return;
    setDeletingId(id);
    try {
      await deleteExpense.mutateAsync(id);
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border bg-card p-4">
        <h2 className="mb-3 text-lg font-semibold">Recent expenses</h2>
        <div className="text-muted-foreground text-sm">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border bg-card p-4">
        <h2 className="mb-3 text-lg font-semibold">Recent expenses</h2>
        <p className="text-destructive text-sm">Failed to load expenses.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card p-4">
      <h2 className="mb-3 text-lg font-semibold">Recent expenses</h2>
      {recent.length === 0 ? (
        <p className="text-muted-foreground text-sm">No expenses in this period.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="pb-2 pr-4 font-medium">Date</th>
                <th className="pb-2 pr-4 font-medium">Category</th>
                <th className="pb-2 pr-4 font-medium">Purpose</th>
                <th className="pb-2 text-right font-medium">Amount</th>
                <th className="w-10 pb-2" aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {recent.map((e) => (
                <tr key={e.id} className="border-b last:border-0">
                  <td className="py-2 pr-4">{format(new Date(e.expenseDate), "dd MMM")}</td>
                  <td className="py-2 pr-4 capitalize">{e.category}</td>
                  <td className="py-2 pr-4 text-muted-foreground">
                    {e.description?.trim() ? e.description : "—"}
                  </td>
                  <td className="py-2 text-right font-medium">₹{e.amount}</td>
                  <td className="py-2 pl-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(e.id)}
                      disabled={deletingId === e.id}
                      aria-label={`Delete expense ${e.category} ₹${e.amount}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
