import type { SavedCalculationRow } from "@/types/database";

export interface SavedCalculationsSummary {
  count: number;
  totalUnits: number;
  /** Unit-weighted average of saved GWAs, or null when it isn't meaningful. */
  cumulativeGwa: number | null;
}

/**
 * Cumulative GWA = unit-weighted average of saved results. Only produced when
 * every saved calculation uses the same grading system, since mixing scales
 * is meaningless.
 */
export function summarizeSavedCalculations(
  calculations: Pick<SavedCalculationRow, "gwa" | "total_units" | "grading_system_id">[]
): SavedCalculationsSummary {
  const totalUnits =
    Math.round(calculations.reduce((sum, c) => sum + Number(c.total_units), 0) * 100) / 100;

  const sameSystem =
    calculations.length > 0 &&
    calculations.every((c) => c.grading_system_id === calculations[0]!.grading_system_id);

  const cumulativeGwa =
    sameSystem && totalUnits > 0
      ? calculations.reduce((sum, c) => sum + Number(c.gwa) * Number(c.total_units), 0) /
        totalUnits
      : null;

  return { count: calculations.length, totalUnits, cumulativeGwa };
}
