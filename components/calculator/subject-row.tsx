"use client";

import type { SubjectFieldErrors, SubjectInput } from "@/types/calculator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SubjectRowProps {
  index: number;
  subject: SubjectInput;
  errors?: SubjectFieldErrors;
  gradeMin: number;
  gradeMax: number;
  gradeStep: number;
  onChange: (id: string, field: "name" | "units" | "grade", value: string) => void;
  onRemove: (id: string) => void;
  canRemove: boolean;
}

export function SubjectRow({
  index,
  subject,
  errors,
  gradeMin,
  gradeMax,
  gradeStep,
  onChange,
  onRemove,
  canRemove,
}: SubjectRowProps) {
  return (
    <div className="grid grid-cols-1 gap-3 border-b border-ink-100 py-3 last:border-b-0 sm:grid-cols-[2.5rem_1fr_6rem_6rem_5.5rem] sm:items-start sm:gap-4">
      <div
        className="hidden select-none pt-2.5 text-sm tabular text-ink-300 sm:block"
        aria-hidden="true"
      >
        {index + 1}
      </div>

      <Input
        label={`Subject ${index + 1} name`}
        hideLabel
        placeholder={`Subject ${index + 1} (e.g. Calculus 1)`}
        value={subject.name}
        maxLength={120}
        onChange={(e) => onChange(subject.id, "name", e.target.value)}
        error={errors?.name}
      />

      <Input
        label={`Subject ${index + 1} units`}
        hideLabel
        placeholder="Units"
        inputMode="decimal"
        value={subject.units}
        onChange={(e) => onChange(subject.id, "units", e.target.value)}
        error={errors?.units}
      />

      <Input
        label={`Subject ${index + 1} grade`}
        hideLabel
        placeholder="Grade"
        inputMode="decimal"
        step={gradeStep}
        min={gradeMin}
        max={gradeMax}
        value={subject.grade}
        onChange={(e) => onChange(subject.id, "grade", e.target.value)}
        error={errors?.grade}
      />

      <div className="flex justify-end sm:justify-center sm:pt-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onRemove(subject.id)}
          disabled={!canRemove}
          aria-label={`Remove subject ${index + 1}${subject.name ? `: ${subject.name}` : ""}`}
          className="whitespace-nowrap"
        >
          Remove
        </Button>
      </div>
    </div>
  );
}
