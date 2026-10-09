"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Calculator, Plus, RotateCcw } from "lucide-react";
import type {
  EditingCalculation,
  GwaResult,
  SubjectFieldErrorMap,
  SubjectInput,
} from "@/types/calculator";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { SubjectRow } from "@/components/calculator/subject-row";
import { GradingSystemSelect } from "@/components/calculator/grading-system-select";
import { GwaSummary } from "@/components/calculator/gwa-summary";
import { TargetGwaPanel } from "@/components/calculator/target-gwa-panel";
import { WhatIfPanel } from "@/components/calculator/what-if-panel";
import { SaveGwaButton } from "@/components/calculator/save-gwa-button";
import { calculateGwa } from "@/lib/calculator/gwa";
import {
  parseSubjectInputs,
  createRowId,
  isBlankRow,
  subjectsToInputs,
} from "@/lib/calculator/parse";
import { getGradingSystem, DEFAULT_GRADING_SYSTEM_ID } from "@/lib/calculator/grading-systems";
import {
  readPendingCalculation,
  clearPendingCalculation,
} from "@/lib/calculator/pending-calculation";
import { submitCalculation } from "@/lib/calculator/save-request";

function emptyRow(): SubjectInput {
  return { id: createRowId(), name: "", units: "", grade: "" };
}

/** Starting rows: the saved calculation being edited, or two blank rows. */
function startingRows(editing?: EditingCalculation): SubjectInput[] {
  return editing ? subjectsToInputs(editing.subjects) : [emptyRow(), emptyRow()];
}

export function CalculatorApp({
  isAuthenticated,
  editing,
}: {
  isAuthenticated: boolean;
  /** When set, the calculator is pre-filled from a saved calculation and offers "Update" instead of "Save". */
  editing?: EditingCalculation;
}) {
  const [gradingSystemId, setGradingSystemId] = useState(
    editing?.gradingSystemId ?? DEFAULT_GRADING_SYSTEM_ID
  );
  const [rows, setRows] = useState<SubjectInput[]>(() => startingRows(editing));
  const [fieldErrors, setFieldErrors] = useState<SubjectFieldErrorMap>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [result, setResult] = useState<GwaResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [restoredNotice, setRestoredNotice] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<
    { state: "saving" } | { state: "saved" } | { state: "error"; message: string } | null
  >(null);
  const [resetArmed, setResetArmed] = useState(false);

  // Reset needs a second click; it disarms itself after a few seconds.
  useEffect(() => {
    if (!resetArmed) return;
    const t = setTimeout(() => setResetArmed(false), 4000);
    return () => clearTimeout(t);
  }, [resetArmed]);

  const gradingSystem = getGradingSystem(gradingSystemId);
  const fmt = (n: number) => n.toFixed(gradingSystem.step < 1 ? 2 : 0);

  // If the person just logged in or registered after being prompted to save,
  // restore the draft they were working on and, if they asked to save it,
  // save it for them now.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("restore") !== "1") return;
    const pending = readPendingCalculation();
    if (!pending) return;

    setGradingSystemId(pending.gradingSystemId);
    setRows(subjectsToInputs(pending.subjects));
    clearPendingCalculation();

    if (!pending.autoSave || !isAuthenticated || editing) {
      setRestoredNotice(true);
      return;
    }

    setAutoSaveStatus({ state: "saving" });
    submitCalculation({
      gradingSystemId: pending.gradingSystemId,
      subjects: pending.subjects,
      details: pending.details ?? { name: "", semester: "", academicYear: "", schoolOrProgram: "" },
      failureMessage: "Couldn't save your GWA. Please try again.",
    }).then((res) => {
      if (res.ok) {
        setAutoSaveStatus({ state: "saved" });
      } else {
        setAutoSaveStatus({ state: "error", message: res.message });
      }
    });
    // Runs once on arrival from the login/register redirect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function updateRow(id: string, field: "name" | "units" | "grade", value: string) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  }

  function addRow() {
    setRows((prev) => [...prev, emptyRow()]);
  }

  function removeRow(id: string) {
    setRows((prev) => (prev.length > 1 ? prev.filter((r) => r.id !== id) : prev));
  }

  function resetAll() {
    setResetArmed(false);
    setRows(startingRows(editing));
    setFieldErrors({});
    setFormError(null);
    setResult(null);
  }

  async function handleCalculate() {
    setFormError(null);

    const nonEmptyRows = rows.filter((r) => !isBlankRow(r));

    if (nonEmptyRows.length === 0) {
      setFormError("Add at least one subject with a name, units, and grade.");
      setResult(null);
      return;
    }

    const parsed = parseSubjectInputs(
      nonEmptyRows,
      gradingSystem.minValue,
      gradingSystem.maxValue
    );
    setFieldErrors(parsed.fieldErrors);

    if (parsed.hasErrors) {
      setResult(null);
      return;
    }

    setIsCalculating(true);
    // Calculation is instant, but a brief tick keeps the button's loading
    // state meaningful rather than purely decorative.
    await new Promise((resolve) => setTimeout(resolve, 120));

    const calc = calculateGwa(parsed.subjects, { gradingSystem });
    setIsCalculating(false);

    if (!calc.ok) {
      setFormError(calc.message);
      setResult(null);
      return;
    }

    setResult(calc.result);
  }

  // Valid subjects as currently typed; feeds the save and what-if panels.
  const currentSubjects = useMemo(
    () =>
      result
        ? parseSubjectInputs(rows, gradingSystem.minValue, gradingSystem.maxValue).subjects
        : [],
    [result, rows, gradingSystem.minValue, gradingSystem.maxValue]
  );

  return (
    <div className="flex flex-col gap-6">
      {autoSaveStatus?.state === "saving" && <Alert tone="info">Welcome back! Saving your GWA…</Alert>}
      {autoSaveStatus?.state === "saved" && (
        <Alert tone="success">
          Welcome back! Your GWA is saved. You can find it any time on your{" "}
          <Link href="/dashboard" className="underline">
            dashboard
          </Link>
          .
        </Alert>
      )}
      {autoSaveStatus?.state === "error" && (
        <Alert tone="error">
          Welcome back! Your calculation is right where you left it, but we couldn't save it just
          yet ({autoSaveStatus.message}) Press Calculate GWA, then Save to try again.
        </Alert>
      )}

      {restoredNotice && (
        <Alert tone="success">
          Welcome back — we restored the calculation you were working on before you logged in.
        </Alert>
      )}

      <Card className="p-5 sm:p-6">
        <div className="flex flex-col gap-5">
          <div>
            <h2 className="font-serif text-xl font-medium leading-tight text-ink-900">Subjects</h2>
            <p className="mt-1 text-sm text-ink-500">
              Enter each subject once, with its units and the grade you received or expect. Add as many rows as you need, then press Calculate GWA to see your result.
            </p>
          </div>
          <GradingSystemSelect value={gradingSystemId} onChange={setGradingSystemId} />
        </div>

        <div
          className="mt-5 hidden grid-cols-[2.5rem_1fr_6rem_6rem_2.4rem] gap-4 border-b border-ink-100 pb-2 text-xs font-medium uppercase tracking-wide text-ink-500 sm:grid"
          aria-hidden="true"
        >
          <span>No</span>
          <span>Subject</span>
          <span>Units</span>
          <span>Grade</span>
          <span />
        </div>

        <div className="mt-2 sm:mt-0">
          {rows.map((row, index) => (
            <SubjectRow
              key={row.id}
              index={index}
              subject={row}
              errors={fieldErrors[row.id]}
              gradeMin={gradingSystem.minValue}
              gradeMax={gradingSystem.maxValue}
              gradeStep={gradingSystem.step}
              onChange={updateRow}
              onRemove={removeRow}
              canRemove={rows.length > 1}
            />
          ))}
        </div>

        <div className="mt-5 flex flex-col gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={addRow}
            className="w-full border-dashed py-3"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add subject
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => (resetArmed ? resetAll() : setResetArmed(true))}
            onBlur={() => setResetArmed(false)}
            className={`w-full border py-3 transition-colors ${
              resetArmed
                ? "!border-danger-600/50 !bg-danger-100 !text-danger-600 hover:!bg-danger-100"
                : "border-ink-100 hover:!border-danger-600/40 hover:!bg-danger-100 hover:!text-danger-600"
            }`}
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            {resetArmed ? "Click again to confirm reset" : "Reset"}
          </Button>
          <hr className="my-2 border-t border-ink-100" />
          <Button
            type="button"
            onClick={handleCalculate}
            isLoading={isCalculating}
            className="w-full py-3"
          >
            {!isCalculating && <Calculator className="h-4 w-4" aria-hidden="true" />}
            Calculate GWA
          </Button>
        </div>

        {formError && (
          <Alert tone="error" className="mt-4">
            {formError}
          </Alert>
        )}
      </Card>

      {result && (
        <>
          <GwaSummary result={result} gradingSystem={gradingSystem} />

          <div className="flex flex-col gap-3">
            <SaveGwaButton
              isAuthenticated={isAuthenticated}
              subjects={currentSubjects}
              gradingSystem={gradingSystem}
              gwa={result.gwa}
              editing={editing}
            />
          </div>

          {/* Side by side from md up; stacked on phones. Cards stretch to equal height. */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <TargetGwaPanel gwa={result.gwa} gradingSystem={gradingSystem} />

            <WhatIfPanel
              subjects={currentSubjects}
              gradingSystem={gradingSystem}
              currentGwa={result.gwa}
            />
          </div>
        </>
      )}

      <p className="text-xs leading-relaxed text-ink-500">
        Grading policies differ between schools — some round differently, some exclude certain
        subjects (like PE or NSTP) from the GWA, and honors cutoffs vary. Treat this result as a
        close estimate and confirm anything that matters (scholarships, latin honors, academic
        probation) against your registrar's own computation.
      </p>
    </div>
  );
}