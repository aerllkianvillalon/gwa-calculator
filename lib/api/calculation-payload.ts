import type { NextRequest, NextResponse } from "next/server";
import { saveCalculationSchema } from "@/lib/validation/schemas";
import { calculateGwa } from "@/lib/calculator/gwa";
import { getGradingSystem } from "@/lib/calculator/grading-systems";
import { errorResponse } from "@/lib/api/responses";

/** Columns shared by insert (POST) and update (PATCH) on `saved_calculations`. */
export interface CalculationColumns {
  name: string | null;
  grading_system_id: string;
  gwa: number;
  total_units: number;
  subjects: { id: string; name: string; units: number; grade: number }[];
  semester: string | null;
  academic_year: string | null;
  school_or_program: string | null;
}

type PayloadResult =
  | { ok: true; columns: CalculationColumns }
  | { ok: false; response: NextResponse };

/**
 * Reads and validates a save/update request body and turns it into database
 * columns. The GWA is never taken from the browser: it is recomputed here from
 * the raw subjects before anything is persisted.
 */
export async function parseCalculationPayload(request: NextRequest): Promise<PayloadResult> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return { ok: false, response: errorResponse("Invalid request body.", 400) };
  }

  const parsed = saveCalculationSchema.safeParse(body);
  if (!parsed.success) {
    return {
      ok: false,
      response: errorResponse(parsed.error.issues[0]?.message ?? "Invalid input.", 400),
    };
  }

  const input = parsed.data;
  const gradingSystem = getGradingSystem(input.gradingSystemId);
  const subjects = input.subjects.map((s) => ({
    id: s.id,
    name: s.name,
    units: s.units,
    grade: s.grade,
  }));

  const calc = calculateGwa(subjects, { gradingSystem });
  if (!calc.ok) {
    return { ok: false, response: errorResponse(calc.message, 400) };
  }

  return {
    ok: true,
    columns: {
      name: input.name ?? null,
      grading_system_id: gradingSystem.id,
      gwa: calc.result.gwa,
      total_units: calc.result.totalUnits,
      subjects,
      semester: input.semester ?? null,
      academic_year: input.academicYear ?? null,
      school_or_program: input.schoolOrProgram ?? null,
    },
  };
}
