"use client";

import { useState } from "react";
import { Target } from "lucide-react";
import type { GradingSystem } from "@/types/calculator";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { compareToTarget } from "@/lib/calculator/gwa";
import { cn } from "@/lib/utils";

/** One-tap goals per scale; unknown scales simply show no shortcuts. */
const QUICK_TARGETS: Record<string, number[]> = {
  "ph-1.00-5.00": [1.25, 1.5, 1.75, 2.0],
  "percentage-100": [85, 90, 95],
  "us-gpa-4.0": [3.0, 3.5, 3.8],
};

function Stat({ label, value, emphasis }: { label: string; value: string; emphasis?: boolean }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-ink-500">{label}</dt>
      <dd
        className={cn(
          "mt-0.5 font-serif text-2xl font-medium tabular",
          emphasis ? "text-ledger-900" : "text-ink-900"
        )}
      >
        {value}
      </dd>
    </div>
  );
}

export function TargetGwaPanel({
  gwa,
  gradingSystem,
}: {
  gwa: number;
  gradingSystem: GradingSystem;
}) {
  const [target, setTarget] = useState("");

  const targetNum = Number(target);
  const isValidTarget =
    target.trim() !== "" &&
    Number.isFinite(targetNum) &&
    targetNum >= gradingSystem.minValue &&
    targetNum <= gradingSystem.maxValue;

  const comparison = isValidTarget
    ? compareToTarget(gwa, targetNum, gradingSystem)
    : null;

  const quickTargets = QUICK_TARGETS[gradingSystem.id] ?? [];
  const formatTarget = (n: number) => (gradingSystem.lowerIsBetter ? n.toFixed(2) : String(n));

  return (
    <Card className="h-full p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-ledger-100 text-ledger-900"
          aria-hidden="true"
        >
          <Target className="h-5 w-5" />
        </span>
        <div>
          <h2 className="font-serif text-lg font-medium text-ink-900">Target GWA</h2>
          <p className="mt-1 text-sm text-ink-500">
            Set a goal and see how far your current result is from it.
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-4">
        <div className="flex flex-col gap-3">
          <Input
            label="Target GWA"
            type="number"
            inputMode="decimal"
            step={gradingSystem.step}
            min={gradingSystem.minValue}
            max={gradingSystem.maxValue}
            placeholder={gradingSystem.lowerIsBetter ? "e.g. 1.75" : "e.g. 90"}
            value={target}
            onChange={(e) => setTarget(e.target.value)}
          />

          {quickTargets.length > 0 && (
            <div className="flex gap-2" role="group" aria-label="Quick targets">
              {quickTargets.map((n) => {
                const label = formatTarget(n);
                const selected = target.trim() !== "" && Number(target) === n;
                return (
                  <button
                    key={n}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setTarget(label)}
                    className={cn(
                      "flex-1 rounded-full border px-3 py-1.5 text-center text-xs font-medium tabular transition-colors",
                      selected
                        ? "border-ledger-500 bg-ledger-100 text-ledger-900"
                        : "border-ink-100 bg-white text-ink-700 hover:border-ledger-500"
                    )}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div aria-live="polite">
          {comparison ? (
            <div
              className={cn(
                "rounded-md border p-4",
                comparison.met
                  ? "border-ledger-300 bg-ledger-100"
                  : "border-ink-100 bg-paper"
              )}
            >
              <dl className="grid grid-cols-3 gap-3">
                <Stat label="Your GWA" value={gwa.toFixed(2)} emphasis />
                <Stat label="Target" value={targetNum.toFixed(2)} />
                <Stat
                  label={comparison.met ? "Ahead by" : "To go"}
                  value={comparison.difference.toFixed(2)}
                  emphasis={comparison.met}
                />
              </dl>
              <p
                className={cn(
                  "mt-3 border-t pt-3 text-sm",
                  comparison.met
                    ? "border-ledger-300 text-ledger-900"
                    : "border-ink-100 text-ink-700"
                )}
              >
                {comparison.met
                  ? `You're already at or better than your target (by ${comparison.difference.toFixed(2)}).`
                  : `You're ${comparison.difference.toFixed(2)} away from your target.`}
              </p>
            </div>
          ) : (
            !target.trim() && (
              <div className="rounded-md border border-dashed border-ink-100 px-4 py-5 text-sm text-ink-500">
                Enter a target to compare it with your {gwa.toFixed(2)} GWA.
              </div>
            )
          )}
        </div>
      </div>

      {target.trim() !== "" && !isValidTarget && (
        <Alert tone="error" className="mt-3">
          Enter a target between {gradingSystem.minValue} and {gradingSystem.maxValue}.
        </Alert>
      )}
    </Card>
  );
}