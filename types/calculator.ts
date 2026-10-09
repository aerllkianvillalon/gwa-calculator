/**
 * Domain types for the GWA calculator. Kept framework-agnostic so the
 * calculation logic can be unit tested without React or Next.js.
 */

export interface GradingSystem {
  /** Stable identifier, stored alongside saved calculations. */
  id: string;
  /** Human readable label shown in the UI. */
  label: string;
  /** Short explanation of how the scale works. */
  description: string;
  /** Lowest allowed numeric grade value on this scale. */
  minValue: number;
  /** Highest allowed numeric grade value on this scale. */
  maxValue: number;
  /** Whether a lower number is a better grade (e.g. Philippine 1.00 scale). */
  lowerIsBetter: boolean;
  /** Smallest increment the UI should encourage (for step attributes). */
  step: number;
  /** The boundary at which a grade is considered passing. */
  passingValue: number;
}

export interface Subject {
  id: string;
  name: string;
  /** Units or credit hours for the subject. */
  units: number;
  /** Numeric grade on the selected grading system's scale. */
  grade: number;
}

/** A subject as raw, unvalidated string input straight from a form field. */
export interface SubjectInput {
  id: string;
  name: string;
  units: string;
  grade: string;
}

/** Per-field validation messages for one subject row. */
export interface SubjectFieldErrors {
  name?: string;
  units?: string;
  grade?: string;
}

/** Validation messages keyed by subject row id. */
export type SubjectFieldErrorMap = Record<string, SubjectFieldErrors>;

export interface SubjectBreakdownRow {
  id: string;
  name: string;
  units: number;
  grade: number;
  /** grade * units, i.e. this subject's contribution to the numerator. */
  weightedPoints: number;
  /** weightedPoints / totalUnits, this subject's share of the final GWA. */
  contributionPercent: number;
}

export interface GwaResult {
  gwa: number;
  totalUnits: number;
  totalWeightedPoints: number;
  breakdown: SubjectBreakdownRow[];
}

export type GwaCalculationError =
  | "EMPTY_LIST"
  | "ZERO_TOTAL_UNITS"
  | "INVALID_SUBJECT";

export interface GwaCalculationFailure {
  ok: false;
  error: GwaCalculationError;
  message: string;
}

export interface GwaCalculationSuccess {
  ok: true;
  result: GwaResult;
}

export type GwaCalculation = GwaCalculationSuccess | GwaCalculationFailure;

/** A saved calculation loaded into the calculator for editing. */
export interface EditingCalculation {
  id: string;
  name: string;
  semester: string;
  academicYear: string;
  schoolOrProgram: string;
  gradingSystemId: string;
  subjects: Subject[];
}
