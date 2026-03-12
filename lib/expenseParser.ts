import type { ParsedExpense } from "@/types/expense";

/**
 * Parse a natural-language expense message into amount, category, and optional description.
 * Examples: "500 fuel" -> { amount: 500, category: "fuel" }
 *           "1200 electricity bill" -> { amount: 1200, category: "electricity", description: "bill" }
 */
export function parseExpense(message: string): ParsedExpense {
  const parsed = parseExpenses(message);
  return parsed[parsed.length - 1]!;
}

function normalizeMessage(message: string) {
  const trimmed = message.trim();
  if (!trimmed) throw new Error("Message is empty");
  return trimmed
    .toLowerCase()
    .replace(/₹/g, " ")
    .replace(/\brs\.?\b/g, " ")
    .replace(/\brupees?\b/g, " ")
    .replace(/[,]/g, "");
}

const STOPWORDS = new Set([
  "for",
  "on",
  "at",
  "to",
  "in",
  "of",
  "a",
  "an",
  "the",
  "my",
  "this",
  "that",
  "paid",
  "pay",
  "spent",
  "spend",
  "buy",
  "bought"
]);

const CATEGORY_KEYWORDS: Array<{ category: string; keywords: string[] }> = [
  { category: "mobile", keywords: ["mobile", "phone", "recharge", "sim"] },
  { category: "internet", keywords: ["wifi", "broadband", "internet", "data"] },
  { category: "food", keywords: ["food", "lunch", "dinner", "breakfast", "tea", "coffee", "snack"] },
  { category: "groceries", keywords: ["grocery", "groceries", "vegetables", "veggies", "milk", "ghee"] },
  { category: "fuel", keywords: ["fuel", "petrol", "diesel", "gas"] },
  { category: "transport", keywords: ["uber", "ola", "taxi", "bus", "metro", "train", "auto", "cab"] },
  { category: "rent", keywords: ["rent"] },
  { category: "electricity", keywords: ["electricity", "power"] },
  { category: "water", keywords: ["water"] },
  { category: "shopping", keywords: ["shopping", "amazon", "flipkart", "myntra"] },
  { category: "entertainment", keywords: ["movie", "cinema", "netflix", "spotify", "game"] },
  { category: "medical", keywords: ["doctor", "medicine", "hospital", "pharmacy"] },
  { category: "travel", keywords: ["flight", "hotel", "trip", "travel"] },
  { category: "education", keywords: ["course", "class", "tuition", "book"] },
  { category: "subscriptions", keywords: ["subscription", "sub", "prime"] }
];

function inferCategoryAndDescription(tokens: string[]) {
  if (tokens.length === 0) return { category: "other", description: undefined as string | undefined };

  let category = "other";
  let matchedKeyword: string | undefined;

  for (const t of tokens) {
    for (const entry of CATEGORY_KEYWORDS) {
      if (entry.keywords.includes(t)) {
        category = entry.category;
        matchedKeyword = t;
        break;
      }
    }
    if (matchedKeyword) break;
  }

  if (category === "other") {
    category = tokens[0] ?? "other";
    matchedKeyword = tokens[0];
  }

  const descriptionTokens = tokens.filter((t) => t !== matchedKeyword);
  const description =
    descriptionTokens.length
      ? descriptionTokens.join(" ")
      : matchedKeyword && matchedKeyword !== category
        ? matchedKeyword
        : undefined;
  return { category, description };
}

/**
 * Parse a message that may contain multiple expenses.
 * Example: "120 ghee 20 tea 50 chhath" ->
 *  [{amount:120, category:"groceries", description:"ghee"},
 *   {amount:20, category:"food", description:"tea"},
 *   {amount:50, category:"chhath"}]
 */
export function parseExpenses(message: string): ParsedExpense[] {
  const normalized = normalizeMessage(message);

  const amountMatches = [...normalized.matchAll(/\b(\d+(?:\.\d+)?)\b/g)];
  if (amountMatches.length === 0) throw new Error("Could not find an amount");

  const parsed: ParsedExpense[] = [];

  for (let i = 0; i < amountMatches.length; i++) {
    const m = amountMatches[i]!;
    const next = amountMatches[i + 1];

    const amount = Number(m[1]);
    if (Number.isNaN(amount) || amount <= 0) continue;

    const segStart = (m.index ?? 0) + m[0].length;
    const segEnd = next?.index ?? normalized.length;
    const segment = normalized.slice(segStart, segEnd);

    const cleaned = segment
      .replace(/[^\p{L}\p{N}\s-]/gu, " ")
      .replace(/\s+/g, " ")
      .trim();

    const rawTokens = cleaned.split(/\s+/).filter(Boolean);
    const tokens = rawTokens.filter((t) => !STOPWORDS.has(t));

    const { category, description } = inferCategoryAndDescription(tokens);
    parsed.push({ amount, category, description });
  }

  if (parsed.length === 0) throw new Error("Invalid amount");
  return parsed;
}
