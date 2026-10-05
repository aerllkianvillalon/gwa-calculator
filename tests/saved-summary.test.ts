import { describe, it, expect } from "vitest";
import { summarizeSavedCalculations } from "@/lib/calculator/saved-summary";

const row = (gwa: number, total_units: number, grading_system_id = "ph-1.00-5.00") => ({
  gwa,
  total_units,
  grading_system_id,
});

describe("summarizeSavedCalculations", () => {
  it("returns zeros and no cumulative GWA for an empty list", () => {
    expect(summarizeSavedCalculations([])).toEqual({
      count: 0,
      totalUnits: 0,
      cumulativeGwa: null,
    });
  });

  it("weights each saved GWA by its units", () => {
    const s = summarizeSavedCalculations([row(1.5, 18), row(2.0, 12)]);
    expect(s.count).toBe(2);
    expect(s.totalUnits).toBe(30);
    expect(s.cumulativeGwa).toBe((1.5 * 18 + 2.0 * 12) / 30);
  });

  it("omits the cumulative GWA when grading systems are mixed", () => {
    const s = summarizeSavedCalculations([row(1.5, 18), row(90, 12, "percentage-100")]);
    expect(s.cumulativeGwa).toBe(null);
    expect(s.totalUnits).toBe(30);
  });

  it("coerces numeric strings (Postgres numeric columns) before summing", () => {
    const s = summarizeSavedCalculations([row("1.5" as unknown as number, "10" as unknown as number)]);
    expect(s.totalUnits).toBe(10);
    expect(s.cumulativeGwa).toBe(1.5);
  });
});
