import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { parseCalculationPayload } from "@/lib/api/calculation-payload";
import { subjectsToInputs } from "@/lib/calculator/parse";

function req(body: unknown) {
  return new NextRequest("http://localhost/api/calculations", {
    method: "POST",
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

const subjects = [
  { id: "a", name: "Math", units: 3, grade: 1.5 },
  { id: "b", name: "Sci", units: 1, grade: 2.5 },
];

describe("parseCalculationPayload", () => {
  it("recomputes GWA server-side and maps to columns", async () => {
    const r = await parseCalculationPayload(
      req({ gradingSystemId: "ph-1.00-5.00", name: "Sem", semester: "", subjects, gwa: 1 })
    );
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.columns.gwa).toBe(1.75);
      expect(r.columns.total_units).toBe(4);
      expect(r.columns.name).toBe("Sem");
      expect(r.columns.semester).toBeNull();
    }
  });

  it("rejects malformed JSON and out-of-range grades with 400", async () => {
    const bad = await parseCalculationPayload(req("{nope"));
    expect(!bad.ok && bad.response.status).toBe(400);
    const range = await parseCalculationPayload(
      req({ gradingSystemId: "ph-1.00-5.00", subjects: [{ ...subjects[0], grade: 9 }] })
    );
    expect(!range.ok && range.response.status).toBe(400);
  });
});

describe("subjectsToInputs", () => {
  it("stringifies numeric fields", () => {
    expect(subjectsToInputs(subjects)[0]).toEqual({ id: "a", name: "Math", units: "3", grade: "1.5" });
  });
});
