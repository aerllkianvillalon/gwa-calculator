"use client";

import { useMemo, useState } from "react";
import type { GradingSystem, Subject } from "@/types/calculator";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { calculateGwa, roundTo } from "@/lib/calculator/gwa";

export function WhatIfPanel({
  subjects,
  gradingSystem,
  currentGwa,
}: {
  subjects: Subject[];
  gradingSystem: GradingSystem;
  currentGwa: number;
}) {
  const [enabled, setEnabled] = useState(false);
  const [subjectId, setSubjectId] = useState(subjects[0]?.id ?? "");
  const [hypotheticalGrade, setHypotheticalGrade] = useState("");

  const selected = subjects.find((s) => s.id === subjectId) ?? subjects[0];

  const preview = useMemo(() => {
    if (!enabled || !selected) return null;
    const value = Number(hypotheticalGrade);
    if (hypotheticalGrade.trim() === "" || !Number.isFinite(value)) return null;
    if (value < gradingSystem.minValue || value > gradingSystem.maxValue) return null;

    const modified = subjects.map((s) =>
      s.id === selected.id ? { ...s, grade: value } : s
    );
    const calc = calculateGwa(modified, { gradingSystem });
    if (!calc.ok) return null;
    return calc.result.gwa;
  }, [enabled, selected, hypotheticalGrade, subjects, gradingSystem]);

  if (subjects.length === 0) return null;

  return (
    <Card className="p-5 sm:p-6">
      {/* Stacks on phones (full-width, thumb-sized button); sits beside the text from sm up. */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div>
          <h2 className="font-serif text-lg font-medium text-ink-900">What if?</h2>
          <p className="mt-1 text-sm text-ink-500">
            Try a different grade for one subject without changing your real inputs.
          </p>
        </div>
        <Button
          type="button"
          variant={enabled ? "secondary" : "primary"}
          className="min-h-11 w-full shrink-0 sm:min-h-0 sm:w-auto"
          onClick={() => setEnabled((v) => !v)}
          aria-expanded={enabled}
        >
          {enabled ? "Close" : "Try it"}
        </Button>
      </div>

      {enabled && (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_8rem]">
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
            value={hypotheticalGrade}
            onChange={(e) => setHypotheticalGrade(e.target.value)}
          />
        </div>
      )}

      {enabled && preview !== null && (
        <Alert tone="info" className="mt-3">
          With that change, your GWA would be{" "}
          <span className="font-semibold tabular">{preview.toFixed(2)}</span>{" "}
          (currently {currentGwa.toFixed(2)}, a difference of{" "}
          {roundTo(Math.abs(preview - currentGwa), 2).toFixed(2)}).
        </Alert>
      )}
    </Card>
  );
}