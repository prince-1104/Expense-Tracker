"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";

function applyThemeClass(theme: "light" | "dark") {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(theme);
  root.setAttribute("data-theme", theme);
}

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, resolvedTheme, setTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  // Keep document class in sync with next-themes (in case it doesn't set it)
  useEffect(() => {
    if (!mounted || !resolvedTheme) return;
    const value = resolvedTheme === "dark" ? "dark" : "light";
    applyThemeClass(value);
  }, [mounted, resolvedTheme]);

  const handleClick = () => {
    const next = resolvedTheme === "dark" || theme === "dark" ? "light" : "dark";
    applyThemeClass(next);
    setTheme(next);
    try {
      localStorage.setItem("theme", next);
    } catch {}
  };

  if (!mounted) {
    return <Button variant="outline" size="sm" type="button" className="h-9 w-9 p-0" aria-hidden />;
  }

  const isDark = resolvedTheme === "dark" || theme === "dark";

  return (
    <Button
      variant="outline"
      size="sm"
      type="button"
      className="h-9 w-9 p-0"
      onClick={handleClick}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </Button>
  );
}
