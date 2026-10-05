import { describe, it, expect } from "vitest";
import { parseSubjectInputs, isBlankRow } from "@/lib/calculator/parse";

describe("parseSubjectInputs", () => {
  it("parses valid rows into numeric subjects", () => {
    const result = parseSubjectInputs(
      [{ id: "1", name: "Calc 1", units: "3", grade: "1.5" }],
      1,
      5
    );
    expect(result.hasErrors).toBe(false);
    expect(result.subjects).toEqual([{ id: "1", name: "Calc 1", units: 3, grade: 1.5 }]);
  });

  it("flags a missing subject name", () => {
    const result = parseSubjectInputs([{ id: "1", name: "  ", units: "3", grade: "1.5" }], 1, 5);
    expect(result.hasErrors).toBe(true);
    expect(result.fieldErrors["1"]?.name).toBeDefined();
  });

  it("flags non-numeric units", () => {
    const result = parseSubjectInputs([{ id: "1", name: "A", units: "abc", grade: "1.5" }], 1, 5);
    expect(result.hasErrors).toBe(true);
    expect(result.fieldErrors["1"]?.units).toBeDefined();
  });

  it("flags a grade outside the active grading system's range", () => {
    const result = parseSubjectInputs([{ id: "1", name: "A", units: "3", grade: "9" }], 1, 5);
    expect(result.hasErrors).toBe(true);
    expect(result.fieldErrors["1"]?.grade).toBeDefined();
  });

  it("flags zero or negative units", () => {
    const result = parseSubjectInputs([{ id: "1", name: "A", units: "0", grade: "1.5" }], 1, 5);
    expect(result.hasErrors).toBe(true);
  });

  it("returns an empty subject list for an empty input array", () => {
    const result = parseSubjectInputs([], 1, 5);
    expect(result.subjects).toEqual([]);
    expect(result.hasErrors).toBe(false);
  });
});

describe("isBlankRow", () => {
  it("treats rows with only whitespace as blank", () => {
    expect(isBlankRow({ id: "1", name: " ", units: "", grade: "  " })).toBe(true);
  });

  it("is not blank when any field has content", () => {
    expect(isBlankRow({ id: "1", name: "", units: "3", grade: "" })).toBe(false);
  });
});
