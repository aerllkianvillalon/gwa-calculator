import { NextResponse, type NextRequest } from "next/server";
import { saveCalculationSchema } from "@/lib/validation/schemas";
import { calculateGwa } from "@/lib/calculator/gwa";
import { getGradingSystem } from "@/lib/calculator/grading-systems";
import { checkRateLimit } from "@/lib/rate-limit";
import { requireUser } from "@/lib/api/require-user";
import { errorResponse } from "@/lib/api/responses";

export async function POST(request: NextRequest) {
  const auth = await requireUser("You must be logged in to save a calculation.");
  if (!auth.ok) return auth.response;
  const { supabase, userId } = auth;

  const rateLimit = checkRateLimit(`save-calculation:${userId}`, 20, 60_000);
  if (!rateLimit.allowed) {
    return errorResponse(
      "You're saving calculations too quickly. Please wait a moment and try again.",
      429
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Invalid request body.", 400);
  }

  const parsed = saveCalculationSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0]?.message ?? "Invalid input.", 400);
  }

  const input = parsed.data;
  const gradingSystem = getGradingSystem(input.gradingSystemId);

  // Never trust a GWA value from the browser — recompute it from the raw
  // subjects on the server before persisting anything.
  const calc = calculateGwa(
    input.subjects.map((s) => ({ id: s.id, name: s.name, units: s.units, grade: s.grade })),
    { gradingSystem }
  );

  if (!calc.ok) {
    return errorResponse(calc.message, 400);
  }

  const { data, error } = await supabase
    .from("saved_calculations")
    .insert({
      user_id: userId,
      name: input.name ?? null,
      grading_system_id: gradingSystem.id,
      gwa: calc.result.gwa,
      total_units: calc.result.totalUnits,
      subjects: input.subjects,
      semester: input.semester ?? null,
      academic_year: input.academicYear ?? null,
      school_or_program: input.schoolOrProgram ?? null,
    })
    .select("id")
    .single();

  if (error) {
    // Log server-side for debugging; never leak database internals to the client.
    console.error("Failed to save calculation:", error.message);
    return errorResponse("Couldn't save your calculation right now. Please try again.", 500);
  }

  return NextResponse.json({ id: data.id }, { status: 201 });
}
