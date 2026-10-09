import type {
  Subject,
  SubjectFieldErrorMap,
  SubjectFieldErrors,
  SubjectInput,
} from "@/types/calculator";
import { MAX_SUBJECT_NAME_LENGTH, MAX_UNITS } from "@/lib/calculator/limits";

export interface ParsedSubjectsResult {
  subjects: Subject[];
  fieldErrors: SubjectFieldErrorMap;
  hasErrors: boolean;
}

/** True when a row has no name, units, or grade typed into it. */
export function isBlankRow(row: SubjectInput): boolean {
  return row.name.trim() === "" && row.units.trim() === "" && row.grade.trim() === "";
}

/** Turns validated subjects back into the string-valued rows the form edits. */
export function subjectsToInputs(subjects: Subject[]): SubjectInput[] {
  return subjects.map((s) => ({
    id: s.id,
    name: s.name,
    units: String(s.units),
    grade: String(s.grade),
  }));
}

/**
 * Converts the raw string values in each subject row into numbers, collecting
 * per-field error messages instead of throwing, so the UI can highlight the
 * exact row/field that's wrong.
 */
export function parseSubjectInputs(
  inputs: SubjectInput[],
  gradeMin: number,
  gradeMax: number
): ParsedSubjectsResult {
  const fieldErrors: SubjectFieldErrorMap = {};
  const subjects: Subject[] = [];

  for (const input of inputs) {
    const rowErrors: SubjectFieldErrors = {};
    const name = input.name.trim();
    if (name.length === 0) {
      rowErrors.name = "Required";
    } else if (name.length > MAX_SUBJECT_NAME_LENGTH) {
      rowErrors.name = "Too long";
    }

    const unitsNum = Number(input.units);
    if (input.units.trim() === "" || !Number.isFinite(unitsNum)) {
      rowErrors.units = "Required";
    } else if (unitsNum <= 0) {
      rowErrors.units = "Must be > 0";
    } else if (unitsNum > MAX_UNITS) {
      rowErrors.units = "Too large";
    }

    const gradeNum = Number(input.grade);
    if (input.grade.trim() === "" || !Number.isFinite(gradeNum)) {
      rowErrors.grade = "Required";
    } else if (gradeNum < gradeMin || gradeNum > gradeMax) {
      rowErrors.grade = `Must be ${gradeMin}–${gradeMax}`;
    }

    if (Object.keys(rowErrors).length > 0) {
      fieldErrors[input.id] = rowErrors;
    } else {
      subjects.push({
        id: input.id,
        name,
        units: unitsNum,
        grade: gradeNum,
      });
    }
  }

  return {
    subjects,
    fieldErrors,
    hasErrors: Object.keys(fieldErrors).length > 0,
  };
}

let idCounter = 0;

/** Generates a stable-enough client-side id for a new subject row. */
export function createRowId(): string {
  idCounter += 1;
  return `row-${Date.now()}-${idCounter}`;
}
