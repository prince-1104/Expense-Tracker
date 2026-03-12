"use client";

import { useState } from "react";
import { format } from "date-fns";
import { getPresetRange, type PresetRange } from "@/lib/date";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface DateRangeValue {
  start: string;
  end: string;
  preset: PresetRange;
}

const PRESETS: { value: PresetRange; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "last7", label: "Last 7 Days" },
  { value: "thisMonth", label: "This Month" },
  { value: "lastMonth", label: "Last Month" }
];

function toYYYYMMDD(d: Date) {
  return format(d, "yyyy-MM-dd");
}

interface DateRangeFilterProps {
  value: DateRangeValue;
  onChange: (range: DateRangeValue) => void;
  className?: string;
}

export function DateRangeFilter({ value, onChange, className }: DateRangeFilterProps) {
  const [customStart, setCustomStart] = useState(value.start);
  const [customEnd, setCustomEnd] = useState(value.end);
  const [showCustom, setShowCustom] = useState(value.preset === "custom");

  const applyPreset = (preset: PresetRange) => {
    if (preset === "custom") {
      setShowCustom(true);
      onChange({ start: customStart, end: customEnd, preset: "custom" });
      return;
    }
    setShowCustom(false);
    const range = getPresetRange(preset);
    onChange({
      start: toYYYYMMDD(range.start),
      end: toYYYYMMDD(range.end),
      preset
    });
  };

  const applyCustom = () => {
    onChange({ start: customStart, end: customEnd, preset: "custom" });
  };

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {PRESETS.map(({ value: p, label }) => (
        <Button
          key={p}
          type="button"
          variant={value.preset === p ? "default" : "outline"}
          size="sm"
          onClick={() => applyPreset(p)}
        >
          {label}
        </Button>
      ))}
      <Button
        type="button"
        variant={value.preset === "custom" ? "default" : "outline"}
        size="sm"
        onClick={() => setShowCustom(!showCustom)}
      >
        Custom
      </Button>
      {showCustom && (
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="date"
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={customStart}
            onChange={(e) => setCustomStart(e.target.value)}
          />
          <span className="text-muted-foreground text-sm">to</span>
          <input
            type="date"
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={customEnd}
            onChange={(e) => setCustomEnd(e.target.value)}
          />
          <Button type="button" size="sm" onClick={applyCustom}>
            Apply
          </Button>
        </div>
      )}
    </div>
  );
}

export function getDefaultDateRange(): DateRangeValue {
  const range = getPresetRange("thisMonth");
  return {
    start: toYYYYMMDD(range.start),
    end: toYYYYMMDD(range.end),
    preset: "thisMonth"
  };
}
