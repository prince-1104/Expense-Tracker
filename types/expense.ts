export interface ParsedExpense {
  amount: number;
  category: string;
  description?: string;
}

export interface ExpenseRecord {
  id: string;
  userId: string;
  amount: number;
  category: string;
  description: string | null;
  expenseDate: string;
  createdAt: string;
}

export interface SummaryCategoryRow {
  category: string;
  total: number;
}

export interface ExpenseSummary {
  total_spent: number;
  category_breakdown: SummaryCategoryRow[];
  transaction_count?: number;
}

export type DateRangePreset = "today" | "last7" | "thisMonth" | "lastMonth" | "custom";
