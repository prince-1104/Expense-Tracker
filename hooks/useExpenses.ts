"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { ExpenseRecord, ExpenseSummary } from "@/types/expense";

function getExpensesKey(params: { start_date?: string; end_date?: string }) {
  return ["expenses", params.start_date ?? "", params.end_date ?? ""] as const;
}

function getSummaryKey(params: { start?: string; end?: string }) {
  return ["expenses-summary", params.start ?? "", params.end ?? ""] as const;
}

export function useExpenses(params: { start_date?: string; end_date?: string } = {}) {
  const search = new URLSearchParams();
  if (params.start_date) search.set("start_date", params.start_date);
  if (params.end_date) search.set("end_date", params.end_date);
  const q = search.toString();

  return useQuery({
    queryKey: getExpensesKey(params),
    queryFn: async (): Promise<ExpenseRecord[]> => {
      const res = await fetch(`/api/expenses${q ? `?${q}` : ""}`);
      if (!res.ok) throw new Error("Failed to fetch expenses");
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to fetch expenses");
      return json.data;
    }
  });
}

export function useExpenseSummary(params: { start?: string; end?: string } = {}) {
  const search = new URLSearchParams();
  if (params.start) search.set("start", params.start);
  if (params.end) search.set("end", params.end);
  const q = search.toString();

  return useQuery({
    queryKey: getSummaryKey(params),
    queryFn: async (): Promise<ExpenseSummary> => {
      const res = await fetch(`/api/expenses/summary${q ? `?${q}` : ""}`);
      if (!res.ok) throw new Error("Failed to fetch summary");
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to fetch summary");
      return json.data;
    }
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (message: string) => {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message })
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error ?? "Failed to add expense");
      return json.data as ExpenseRecord | ExpenseRecord[];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["expenses-summary"] });
    }
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/expenses/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error ?? "Failed to delete expense");
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["expenses-summary"] });
    }
  });
}
