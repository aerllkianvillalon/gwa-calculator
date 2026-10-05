"use client";

import { useMemo, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import type { GradingSystem, Subject } from "@/types/calculator";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { calculateGwa, roundTo } from "@/lib/calculator/gwa";
import { cn } from "@/lib/utils";

function Stat({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-ink-500">{label}</dt>
      <dd className={cn("mt-0.5 font-serif text-2xl font-medium tabular", tone ?? "text-ink-900")}>
        {value}
      </dd>
    </div>
  );
}

export function WhatIfPanel({
  subjects,
  gradingSystem,
  currentGwa,
}: {
  subjects: Subject[];
  gradingSystem: GradingSystem;
  currentGwa: number;
}) {
  const [subjectId, setSubjectId] = useState(subjects[0]?.id ?? "");
  const [hypotheticalGrade, setHypotheticalGrade] = useState("");

  const selected = subjects.find((s) => s.id === subjectId) ?? subjects[0];

  const preview = useMemo(() => {
    if (!selected) return null;
    const value = Number(hypotheticalGrade);
    if (hypotheticalGrade.trim() === "" || !Number.isFinite(value)) return null;
    if (value < gradingSystem.minValue || value > gradingSystem.maxValue) return null;

    const modified = subjects.map((s) =>
      s.id === selected.id ? { ...s, grade: value } : s
    );
    const calc = calculateGwa(modified, { gradingSystem });
    if (!calc.ok) return null;
    return calc.result.gwa;
  }, [selected, hypotheticalGrade, subjects, gradingSystem]);

  if (subjects.length === 0) return null;

  // Direction depends on the scale: on 1.00–5.00 a lower number is an improvement.
  const delta = preview === null ? 0 : roundTo(preview - currentGwa, 2);
  const improved = gradingSystem.lowerIsBetter ? delta < 0 : delta > 0;
  const worsened = delta !== 0 && !improved;
  const deltaTone = improved ? "text-ledger-900" : worsened ? "text-danger-600" : "text-ink-900";
  const deltaLabel = improved ? "Improvement" : worsened ? "Drop" : "Change";

  return (
    <Card className="h-full p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-ledger-100 text-ledger-900"
          aria-hidden="true"
        >
          <SlidersHorizontal className="h-5 w-5" />
        </span>
        <div>
          <h2 className="font-serif text-lg font-medium text-ink-900">What if?</h2>
          <p className="mt-1 text-sm text-ink-500">
            Try a different grade for one subject without changing your real inputs.
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3">
        <Select
          label="Subject"
          value={selected?.id}
          onChange={(e) => setSubjectId(e.target.value)}
          options={subjects.map((s) => ({ value: s.id, label: s.name || "Untitled subject" }))}
        />
        <Input
          label="Hypothetical grade"
          type="number"
          inputMode="decimal"
          step={gradingSystem.step}
          min={gradingSystem.minValue}
          max={gradingSystem.maxValue}
          placeholder={selected ? `Now ${selected.grade.toFixed(2)}` : undefined}
          value={hypotheticalGrade}
          onChange={(e) => setHypotheticalGrade(e.target.value)}
        />
      </div>

      <div className="mt-4" aria-live="polite">
        {preview !== null ? (
          <div className="rounded-md border border-ink-100 bg-paper p-4">
            <dl className="grid grid-cols-3 gap-3">
              <Stat label="Current GWA" value={currentGwa.toFixed(2)} />
              <Stat label="With change" value={preview.toFixed(2)} tone="text-ledger-900" />
              <Stat
                label={deltaLabel}
                value={`${delta > 0 ? "+" : delta < 0 ? "−" : ""}${Math.abs(delta).toFixed(2)}`}
                tone={deltaTone}
              />
            </dl>
            <p className="mt-3 border-t border-ink-100 pt-3 text-sm text-ink-700">
              With that change, your GWA would be{" "}
              <span className="font-semibold tabular">{preview.toFixed(2)}</span> (currently{" "}
              {currentGwa.toFixed(2)}, a difference of {Math.abs(delta).toFixed(2)}).
            </p>
          </div>
        ) : (
          <div className="rounded-md border border-dashed border-ink-100 px-4 py-5 text-sm text-ink-500">
            Enter a grade from {gradingSystem.minValue} to {gradingSystem.maxValue} to preview your
            new GWA.
          </div>
        )}
      </div>
    </Card>
  );
}