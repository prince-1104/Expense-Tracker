"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateExpense } from "@/hooks/useExpenses";
import { cn } from "@/lib/utils";

type ChatMessage = { type: "user"; text: string } | { type: "system"; text: string; error?: boolean };

export function ChatExpenseInput() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const listRef = useRef<HTMLDivElement>(null);
  const createExpense = useCreateExpense();

  useEffect(() => {
    listRef.current?.scrollTo(0, listRef.current.scrollHeight);
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || createExpense.isPending) return;

    setInput("");
    setMessages((prev) => [...prev, { type: "user", text }]);

    try {
      const data = await createExpense.mutateAsync(text);
      const items = Array.isArray(data) ? data : [data];
      setMessages((prev) => [
        ...prev,
        ...items.map((it) => ({
          type: "system" as const,
          text: `Logged ₹${it.amount} in ${it.category}`,
          error: false
        }))
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { type: "system", text: "Could not add expense. Check format (e.g. 500 fuel).", error: true }
      ]);
    }
  };

  return (
    <div className="flex flex-col rounded-2xl border bg-card shadow-sm shadow-black/5">
      <div
        ref={listRef}
        className="flex min-h-[120px] max-h-[240px] flex-col gap-2 overflow-y-auto p-4"
      >
        {messages.length === 0 && (
          <p className="text-muted-foreground text-sm">Type an expense (e.g. 500 fuel, 200 tea)</p>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={cn(
              "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm shadow-black/5",
              msg.type === "user"
                ? "self-end bg-primary text-primary-foreground"
                : "self-start " + (msg.error ? "bg-destructive/10 text-destructive" : "bg-muted")
            )}
          >
            {msg.text}
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2 border-t p-3">
        <Input
          placeholder="Type expense..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={createExpense.isPending}
          className="flex-1 rounded-xl"
        />
        <Button type="submit" className="rounded-xl" disabled={!input.trim() || createExpense.isPending}>
          {createExpense.isPending ? "..." : "Send"}
        </Button>
      </form>
    </div>
  );
}
