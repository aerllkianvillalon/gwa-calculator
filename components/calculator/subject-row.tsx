"use client";

import type { SubjectFieldErrors, SubjectInput } from "@/types/calculator";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { Check, Trash2 } from "lucide-react";
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
  // Two-step remove: first click arms the button (turns red with a check),
  // second click confirms. It disarms itself after a few seconds. Blank rows
  // are removed immediately since there's nothing to lose.
  const [armed, setArmed] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const hasContent = Boolean(subject.name || subject.units || subject.grade);

  useEffect(() => {
    if (!armed) return;
    const t = setTimeout(() => setArmed(false), 3000);
    return () => clearTimeout(t);
  }, [armed]);

  function handleRemove() {
    if (hasContent && !armed) {
      setArmed(true);
      return;
    }
    setLeaving(true);
    setTimeout(() => onRemove(subject.id), 150);
  }

  return (
    <div className={`grid grid-cols-2 gap-x-3 gap-y-3 border-b border-ink-100 py-3 transition-all duration-150 last:border-b-0 motion-reduce:transition-none ${leaving ? "scale-[0.98] opacity-0" : "opacity-100"} sm:grid-cols-[2.5rem_1fr_6rem_6rem_2.4rem] sm:items-start sm:gap-4`}>
      <div
        className="hidden select-none pt-2.5 text-sm tabular text-ink-300 sm:block"
        aria-hidden="true"
      >
        {index + 1}
      </div>

      <div className="col-span-2 sm:col-span-1">
      <Input
        label={`Subject ${index + 1} name`}
        hideLabel
        placeholder={`Subject ${index + 1} (e.g. Calculus 1)`}
        value={subject.name}
        maxLength={120}
        onChange={(e) => onChange(subject.id, "name", e.target.value)}
        error={errors?.name}
      />
      </div>

      <div>
      <Input
        label={`Subject ${index + 1} units`}
        hideLabel
        placeholder="Units"
        inputMode="decimal"
        value={subject.units}
        onChange={(e) => onChange(subject.id, "units", e.target.value)}
        error={errors?.units}
      />
      </div>

      <div>
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
      </div>

      {/* Remove: icon-only trash button, same height as the inputs. */}
      <div className="col-span-2 flex sm:col-span-1 sm:justify-end">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleRemove}
          onBlur={() => setArmed(false)}
          disabled={!canRemove || leaving}
          aria-label={
            armed
              ? `Confirm removing subject ${index + 1}`
              : `Remove subject ${index + 1}${subject.name ? `: ${subject.name}` : ""}`
          }
          title={armed ? "Click again to confirm" : "Remove subject"}
          className={`h-[38px] w-full rounded-md border p-0 transition-colors active:scale-95 sm:w-[38px] ${
            armed
              ? "!border-danger-600 !bg-danger-600 !text-white hover:!bg-danger-hover"
              : "border-ink-100 bg-white text-ink-500 hover:!border-danger-600/40 hover:!bg-danger-100 hover:!text-danger-600 active:!bg-danger-100 disabled:!bg-white disabled:!text-ink-300 disabled:hover:!border-ink-100"
          }`}
        >
          {armed ? (
            <>
              <Check className="h-4 w-4" aria-hidden="true" />
              <span className="text-xs font-medium sm:sr-only">Tap again to remove</span>
            </>
          ) : (
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          )}
        </Button>
      </div>
    </div>
  );
}