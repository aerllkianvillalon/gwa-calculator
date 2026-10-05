import type { GradingSystem } from "@/types/calculator";

/**
 * Grading systems are data, not hard-coded logic, so new scales can be added
 * without touching the calculation engine or the UI components.
 */
export const GRADING_SYSTEMS = {
  "ph-1.00-5.00": {
    id: "ph-1.00-5.00",
    label: "Philippine numeric (1.00–5.00)",
    description:
      "1.00 is the highest possible grade, 5.00 is a failing grade. Common in many Philippine universities, but check your own school's handbook — the passing cutoff and honors thresholds vary by institution.",
    minValue: 1.0,
    maxValue: 5.0,
    lowerIsBetter: true,
    step: 0.25,
    passingValue: 3.0,
  },
  "percentage-100": {
    id: "percentage-100",
    label: "Percentage (0–100)",
    description:
      "0 to 100, where a higher number is a better grade. Used by some schools instead of the 1.00–5.00 scale.",
    minValue: 0,
    maxValue: 100,
    lowerIsBetter: false,
    step: 1,
    passingValue: 75,
  },
  "us-gpa-4.0": {
    id: "us-gpa-4.0",
    label: "4.0 GPA scale",
    description:
      "0 to 4.0, where a higher number is a better grade. Included for reference for schools that report grade points this way.",
    minValue: 0,
    maxValue: 4.0,
    lowerIsBetter: false,
    step: 0.1,
    passingValue: 1.0,
  },
} satisfies Record<string, GradingSystem>;

/** Same table, indexable by an arbitrary (possibly unknown) id. */
const GRADING_SYSTEMS_BY_ID: Record<string, GradingSystem | undefined> = GRADING_SYSTEMS;

export const DEFAULT_GRADING_SYSTEM_ID = "ph-1.00-5.00" satisfies keyof typeof GRADING_SYSTEMS;

export function getGradingSystem(id: string | undefined | null): GradingSystem {
  return (id && GRADING_SYSTEMS_BY_ID[id]) || GRADING_SYSTEMS[DEFAULT_GRADING_SYSTEM_ID];
}

export function listGradingSystems(): GradingSystem[] {
  return Object.values<GradingSystem>(GRADING_SYSTEMS);
}
