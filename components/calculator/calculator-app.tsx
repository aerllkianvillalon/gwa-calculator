"use client";

import { useEffect, useMemo, useState } from "react";
import type { GwaResult, SubjectFieldErrorMap, SubjectInput } from "@/types/calculator";
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
import { parseSubjectInputs, createRowId, isBlankRow } from "@/lib/calculator/parse";
import { getGradingSystem, DEFAULT_GRADING_SYSTEM_ID } from "@/lib/calculator/grading-systems";
import {
  readPendingCalculation,
  clearPendingCalculation,
} from "@/lib/calculator/pending-calculation";

function emptyRow(): SubjectInput {
  return { id: createRowId(), name: "", units: "", grade: "" };
}

function initialRows(): SubjectInput[] {
  return [emptyRow(), emptyRow()];
}

export function CalculatorApp({ isAuthenticated }: { isAuthenticated: boolean }) {
  const [gradingSystemId, setGradingSystemId] = useState(DEFAULT_GRADING_SYSTEM_ID);
  const [rows, setRows] = useState<SubjectInput[]>(initialRows);
  const [fieldErrors, setFieldErrors] = useState<SubjectFieldErrorMap>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [result, setResult] = useState<GwaResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [restoredNotice, setRestoredNotice] = useState(false);

  const gradingSystem = getGradingSystem(gradingSystemId);

  // If the person just logged in after being prompted to save, restore the
  // draft they were working on before the redirect.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("restore") !== "1") return;
    const pending = readPendingCalculation();
    if (!pending) return;

    setGradingSystemId(pending.gradingSystemId);
    setRows(
      pending.subjects.map((s) => ({
        id: s.id,
        name: s.name,
        units: String(s.units),
        grade: String(s.grade),
      }))
    );
    clearPendingCalculation();
    setRestoredNotice(true);
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
    setRows(initialRows());
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
      {restoredNotice && (
        <Alert tone="success">
          Welcome back — we restored the calculation you were working on before you logged in.
        </Alert>
      )}

      <Card className="p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="font-serif text-lg font-medium text-ink-900">Subjects</h2>
            <p className="mt-1 text-sm text-ink-500">
              Enter each subject once, with its units and the grade you received (or expect).
            </p>
          </div>
          <div className="w-full sm:w-64">
            <GradingSystemSelect value={gradingSystemId} onChange={setGradingSystemId} />
          </div>
        </div>

        <div className="mt-4">
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

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={addRow}>
            + Add subject
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={resetAll}>
            Reset
          </Button>
          <div className="ml-auto">
            <Button type="button" onClick={handleCalculate} isLoading={isCalculating}>
              Calculate GWA
            </Button>
          </div>
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

          <div className="flex flex-wrap items-center gap-3">
            <SaveGwaButton
              isAuthenticated={isAuthenticated}
              subjects={currentSubjects}
              gradingSystem={gradingSystem}
              gwa={result.gwa}
            />
          </div>

          <TargetGwaPanel gwa={result.gwa} gradingSystem={gradingSystem} />

          <WhatIfPanel
            subjects={currentSubjects}
            gradingSystem={gradingSystem}
            currentGwa={result.gwa}
          />
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
