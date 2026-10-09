"use client";

import { useId, useRef } from "react";
import { listGradingSystems } from "@/lib/calculator/grading-systems";
import { cn } from "@/lib/utils";

/** Compact labels for the switch; the full label is kept for screen readers and tooltips. */
const SHORT_LABELS: Record<string, string> = {
  "ph-1.00-5.00": "1.00–5.00",
  "percentage-100": "0–100%",
  "us-gpa-4.0": "4.0 GPA",
};

export function GradingSystemSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (id: string) => void;
}) {
  const systems = listGradingSystems();
  const activeIndex = Math.max(
    0,
    systems.findIndex((s) => s.id === value)
  );
  const active = systems[activeIndex]!;
  const labelId = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  function select(index: number) {
    const next = systems[(index + systems.length) % systems.length]!;
    onChange(next.id);
    refs.current[(index + systems.length) % systems.length]?.focus();
  }

  function onKeyDown(e: React.KeyboardEvent, index: number) {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      select(index + 1);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      select(index - 1);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <span id={labelId} className="text-sm font-medium text-ink-700">
        Grading system
      </span>

      <div
        role="radiogroup"
        aria-labelledby={labelId}
        className="relative grid grid-cols-3 rounded-lg border border-ink-100 bg-ink-100/60 p-1"
      >
        {/* Sliding thumb */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-1 left-1 rounded-md bg-ledger-700 shadow-sm transition-transform duration-200 ease-out motion-reduce:transition-none"
          style={{
            width: `calc((100% - 0.5rem) / ${systems.length})`,
            transform: `translateX(${activeIndex * 100}%)`,
          }}
        />
        {systems.map((s, i) => {
          const isActive = i === activeIndex;
          return (
            <button
              key={s.id}
              ref={(el) => {
                refs.current[i] = el;
              }}
              type="button"
              role="radio"
              aria-checked={isActive}
              aria-label={s.label}
              title={s.label}
              tabIndex={isActive ? 0 : -1}
              onClick={() => onChange(s.id)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={cn(
                "relative z-10 rounded-md px-2 py-2 text-center text-sm font-medium tabular transition-colors",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ledger-500",
                isActive ? "text-white" : "text-ink-700 hover:text-ink-900"
              )}
            >
              {SHORT_LABELS[s.id] ?? s.label}
            </button>
          );
        })}
      </div>

      <p className="text-xs leading-relaxed text-ink-500">{active.description}</p>
    </div>
  );
}