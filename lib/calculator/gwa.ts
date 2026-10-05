import type {
  GwaCalculation,
  GradingSystem,
  Subject,
  SubjectBreakdownRow,
} from "@/types/calculator";
import { MAX_SUBJECTS, MAX_UNITS } from "@/lib/calculator/limits";

/** Round to a fixed number of decimals without floating-point drift. */
export function roundTo(value: number, decimals = 2): number {
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

export interface CalculateGwaOptions {
  gradingSystem: GradingSystem;
  roundToDecimals?: number;
}

/**
 * Pure calculation function: GWA = Σ(grade × units) / Σ(units).
 * Takes already-validated numeric subjects — see validation.ts for turning
 * raw form strings into this shape safely.
 */
export function calculateGwa(
  subjects: Subject[],
  options: CalculateGwaOptions
): GwaCalculation {
  const decimals = options.roundToDecimals ?? 2;

  if (subjects.length === 0) {
    return {
      ok: false,
      error: "EMPTY_LIST",
      message: "Add at least one subject before calculating.",
    };
  }

  if (subjects.length > MAX_SUBJECTS) {
    return {
      ok: false,
      error: "INVALID_SUBJECT",
      message: `You can calculate at most ${MAX_SUBJECTS} subjects at a time.`,
    };
  }

  for (const subject of subjects) {
    if (
      !Number.isFinite(subject.units) ||
      !Number.isFinite(subject.grade) ||
      subject.units <= 0 ||
      subject.units > MAX_UNITS
    ) {
      return {
        ok: false,
        error: "INVALID_SUBJECT",
        message: `"${subject.name || "Untitled subject"}" has an invalid number of units.`,
      };
    }
    if (
      subject.grade < options.gradingSystem.minValue ||
      subject.grade > options.gradingSystem.maxValue
    ) {
      return {
        ok: false,
        error: "INVALID_SUBJECT",
        message: `"${subject.name || "Untitled subject"}" has a grade outside the ${options.gradingSystem.minValue}–${options.gradingSystem.maxValue} range for the selected grading system.`,
      };
    }
  }

  const totalUnits = subjects.reduce((sum, s) => sum + s.units, 0);

  if (totalUnits <= 0) {
    return {
      ok: false,
      error: "ZERO_TOTAL_UNITS",
      message: "Total units must be greater than zero.",
    };
  }

  const totalWeightedPoints = subjects.reduce(
    (sum, s) => sum + s.grade * s.units,
    0
  );

  const gwa = roundTo(totalWeightedPoints / totalUnits, decimals);

  const breakdown: SubjectBreakdownRow[] = subjects.map((s) => {
    const weightedPoints = s.grade * s.units;
    return {
      id: s.id,
      name: s.name || "Untitled subject",
      units: s.units,
      grade: s.grade,
      weightedPoints: roundTo(weightedPoints, decimals),
      contributionPercent: roundTo((s.units / totalUnits) * 100, 1),
    };
  });

  return {
    ok: true,
    result: {
      gwa,
      totalUnits: roundTo(totalUnits, decimals),
      totalWeightedPoints: roundTo(totalWeightedPoints, decimals),
      breakdown,
    },
  };
}

/**
 * Compares a computed GWA against a target, respecting whichever direction
 * counts as "better" for the active grading system (e.g. lower is better on
 * the Philippine 1.00–5.00 scale, higher is better on a percentage scale).
 */
export function compareToTarget(
  gwa: number,
  target: number,
  gradingSystem: GradingSystem
): { met: boolean; difference: number } {
  const difference = roundTo(
    gradingSystem.lowerIsBetter ? target - gwa : gwa - target,
    2
  );
  const met = gradingSystem.lowerIsBetter ? gwa <= target : gwa >= target;
  return { met, difference: Math.abs(difference) };
}
