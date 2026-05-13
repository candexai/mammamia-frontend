"use client";

import { useState, useRef, useEffect } from "react";
import { Calendar, ChevronDown, X } from "lucide-react";

interface DateRangePickerProps {
  value: number; // current days value (1-365)
  onChange: (days: number) => void;
}

const PRESET_DAYS = [1, 7, 15, 30] as const;
type PresetDay = (typeof PRESET_DAYS)[number];

const PRESET_LABELS: Record<PresetDay, string> = {
  1: "Today",
  7: "Last 7 days",
  15: "Last 15 days",
  30: "Last 30 days",
};

const MAX_DAYS = 365;

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [customInput, setCustomInput] = useState("");
  const [customError, setCustomError] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isPreset = (PRESET_DAYS as readonly number[]).includes(value);
  const currentLabel = isPreset
    ? PRESET_LABELS[value as PresetDay]
    : value === 1
      ? "Today"
      : `Last ${value} days`;

  const handlePreset = (days: PresetDay) => {
    onChange(days);
    setOpen(false);
    setCustomInput("");
    setCustomError("");
  };

  const handleCustomApply = () => {
    const n = parseInt(customInput, 10);
    if (isNaN(n) || n < 1) {
      setCustomError("Enter a number ≥ 1");
      return;
    }
    if (n > MAX_DAYS) {
      setCustomError(`Max ${MAX_DAYS} days`);
      return;
    }
    onChange(n);
    setOpen(false);
    setCustomInput("");
    setCustomError("");
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-xl border border-border/60 bg-card/80 hover:bg-accent/50 text-foreground transition-colors"
      >
        <Calendar className="w-4 h-4 text-primary/70 shrink-0" />
        <span className="whitespace-nowrap">{currentLabel}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-52 rounded-xl border border-border/60 bg-card shadow-xl z-50 overflow-hidden">
          <div className="p-1">
            {PRESET_DAYS.map((days) => (
              <button
                key={days}
                type="button"
                onClick={() => handlePreset(days)}
                className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                  value === days
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-foreground hover:bg-accent/60"
                }`}
              >
                {PRESET_LABELS[days]}
              </button>
            ))}
          </div>

          {/* Custom N days */}
          <div className="border-t border-border/40 p-3 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Custom (days)
            </p>
            <div className="flex gap-2">
              <input
                type="number"
                min={1}
                max={MAX_DAYS}
                placeholder="e.g. 60"
                value={customInput}
                onChange={(e) => {
                  setCustomInput(e.target.value);
                  setCustomError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && handleCustomApply()}
                className="flex-1 min-w-0 px-2 py-1.5 text-sm rounded-lg border border-border/60 bg-background focus:outline-none focus:ring-1 focus:ring-primary/50"
              />
              <button
                type="button"
                onClick={handleCustomApply}
                className="px-3 py-1.5 text-sm font-semibold rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors shrink-0"
              >
                Go
              </button>
            </div>
            {customError && (
              <p className="text-xs text-destructive">{customError}</p>
            )}
          </div>

          {/* Reset to default */}
          {value !== 1 && (
            <div className="border-t border-border/40 p-2">
              <button
                type="button"
                onClick={() => { onChange(1); setOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-accent/40 rounded-lg transition-colors"
              >
                <X className="w-3 h-3" />
                Reset to today
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
