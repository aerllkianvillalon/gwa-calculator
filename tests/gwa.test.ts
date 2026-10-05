import { describe, it, expect } from "vitest";
import { calculateGwa, roundTo, compareToTarget } from "@/lib/calculator/gwa";
import { GRADING_SYSTEMS } from "@/lib/calculator/grading-systems";
import type { Subject } from "@/types/calculator";

const ph = GRADING_SYSTEMS["ph-1.00-5.00"];
const pct = GRADING_SYSTEMS["percentage-100"];

function subject(id: string, name: string, units: number, grade: number): Subject {
  return { id, name, units, grade };
}

describe("calculateGwa", () => {
  it("computes the correct GWA for a single subject", () => {
    const calc = calculateGwa([subject("1", "Calc 1", 3, 1.5)], { gradingSystem: ph });
    expect(calc.ok).toBe(true);
    if (calc.ok) {
      expect(calc.result.gwa).toBe(1.5);
      expect(calc.result.totalUnits).toBe(3);
    }
  });

  it("computes a weighted average across multiple subjects with equal units", () => {
    // From the spec example: (1.50*3 + 2.00*3) / 6 = 1.75
    const calc = calculateGwa(
      [subject("1", "A", 3, 1.5), subject("2", "B", 3, 2.0)],
      { gradingSystem: ph }
    );
    expect(calc.ok).toBe(true);
    if (calc.ok) expect(calc.result.gwa).toBe(1.75);
  });

  it("weights subjects with different unit loads correctly", () => {
    // (1.00*5 + 3.00*1) / 6 = 1.3333... -> rounds to 1.33
    const calc = calculateGwa(
      [subject("1", "Thesis", 5, 1.0), subject("2", "PE", 1, 3.0)],
      { gradingSystem: ph }
    );
    expect(calc.ok).toBe(true);
    if (calc.ok) expect(calc.result.gwa).toBe(1.33);
  });

  it("supports decimal grades and decimal units", () => {
    const calc = calculateGwa(
      [subject("1", "A", 2.5, 1.25), subject("2", "B", 1.5, 1.75)],
      { gradingSystem: ph }
    );
    expect(calc.ok).toBe(true);
    if (calc.ok) {
      // (1.25*2.5 + 1.75*1.5) / 4 = (3.125 + 2.625) / 4 = 1.4375 -> 1.44
      expect(calc.result.gwa).toBe(1.44);
    }
  });

  it("supports a higher-is-better percentage scale", () => {
    const calc = calculateGwa(
      [subject("1", "A", 3, 88), subject("2", "B", 3, 94)],
      { gradingSystem: pct }
    );
    expect(calc.ok).toBe(true);
    if (calc.ok) expect(calc.result.gwa).toBe(91);
  });

  it("rejects an empty subject list", () => {
    const calc = calculateGwa([], { gradingSystem: ph });
    expect(calc.ok).toBe(false);
    if (!calc.ok) expect(calc.error).toBe("EMPTY_LIST");
  });

  it("rejects zero units on a subject", () => {
    const calc = calculateGwa([subject("1", "A", 0, 1.5)], { gradingSystem: ph });
    expect(calc.ok).toBe(false);
    if (!calc.ok) expect(calc.error).toBe("INVALID_SUBJECT");
  });

  it("rejects negative units", () => {
    const calc = calculateGwa([subject("1", "A", -3, 1.5)], { gradingSystem: ph });
    expect(calc.ok).toBe(false);
  });

  it("rejects a grade outside the grading system's range", () => {
    const calc = calculateGwa([subject("1", "A", 3, 6.0)], { gradingSystem: ph });
    expect(calc.ok).toBe(false);
    if (!calc.ok) expect(calc.error).toBe("INVALID_SUBJECT");
  });

  it("rejects a grade below the grading system's minimum", () => {
    const calc = calculateGwa([subject("1", "A", 3, 0.5)], { gradingSystem: ph });
    expect(calc.ok).toBe(false);
  });

  it("rejects non-finite units or grades", () => {
    const calc = calculateGwa([subject("1", "A", Number.NaN, 1.5)], { gradingSystem: ph });
    expect(calc.ok).toBe(false);
  });

  it("rejects extremely large unit values", () => {
    const calc = calculateGwa([subject("1", "A", 10000, 1.5)], { gradingSystem: ph });
    expect(calc.ok).toBe(false);
  });

  it("produces a breakdown row per subject with correct contribution share", () => {
    const calc = calculateGwa(
      [subject("1", "A", 3, 1.5), subject("2", "B", 1, 2.0)],
      { gradingSystem: ph }
    );
    expect(calc.ok).toBe(true);
    if (calc.ok) {
      expect(calc.result.breakdown).toHaveLength(2);
      expect(calc.result.breakdown[0]?.contributionPercent).toBe(75);
      expect(calc.result.breakdown[1]?.contributionPercent).toBe(25);
    }
  });
});

describe("roundTo", () => {
  it("rounds half-up without floating point drift", () => {
    expect(roundTo(1.005, 2)).toBe(1.01);
    expect(roundTo(1.4375, 2)).toBe(1.44);
    expect(roundTo(1.333333, 2)).toBe(1.33);
  });
});

describe("compareToTarget", () => {
  it("treats a lower GWA as meeting the target on a lower-is-better scale", () => {
    const result = compareToTarget(1.5, 1.75, ph);
    expect(result.met).toBe(true);
    expect(result.difference).toBe(0.25);
  });

  it("treats a higher GWA as not meeting the target on a lower-is-better scale", () => {
    const result = compareToTarget(2.0, 1.75, ph);
    expect(result.met).toBe(false);
    expect(result.difference).toBe(0.25);
  });

  it("treats a higher GWA as meeting the target on a higher-is-better scale", () => {
    const result = compareToTarget(95, 90, pct);
    expect(result.met).toBe(true);
  });
});
