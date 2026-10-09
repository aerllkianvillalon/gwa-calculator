import { NextResponse, type NextRequest } from "next/server";
import { requireUser } from "@/lib/api/require-user";
import { errorResponse } from "@/lib/api/responses";
import { isUuid } from "@/lib/validation/uuid";
import { saveCalculationSchema } from "@/lib/validation/schemas";
import { calculateGwa } from "@/lib/calculator/gwa";
import { getGradingSystem } from "@/lib/calculator/grading-systems";
import { checkRateLimit } from "@/lib/rate-limit";

/** Edit a saved calculation. Same validation as saving; the GWA is always recomputed server-side. */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!isUuid(id)) {
    return errorResponse("Calculation not found.", 404);
  }

  const auth = await requireUser("You must be logged in.");
  if (!auth.ok) return auth.response;
  const { supabase, userId } = auth;

  const rateLimit = checkRateLimit(`edit-calculation:${userId}`, 30, 60_000);
  if (!rateLimit.allowed) {
    return errorResponse("You're editing too quickly. Please wait a moment and try again.", 429);
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

  const calc = calculateGwa(
    input.subjects.map((s) => ({ id: s.id, name: s.name, units: s.units, grade: s.grade })),
    { gradingSystem }
  );
  if (!calc.ok) {
    return errorResponse(calc.message, 400);
  }

  const { error, count } = await supabase
    .from("saved_calculations")
    .update(
      {
        name: input.name ?? null,
        grading_system_id: gradingSystem.id,
        gwa: calc.result.gwa,
        total_units: calc.result.totalUnits,
        subjects: input.subjects,
        semester: input.semester ?? null,
        academic_year: input.academicYear ?? null,
        school_or_program: input.schoolOrProgram ?? null,
      },
      { count: "exact" }
    )
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    console.error("Failed to update calculation:", error.message);
    return errorResponse("Couldn't save your changes. Please try again.", 500);
  }
  if (!count) {
    return errorResponse("Calculation not found.", 404);
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Reject anything that isn't a UUID before it reaches the database.
  if (!isUuid(id)) {
    return errorResponse("Calculation not found.", 404);
  }

  const auth = await requireUser("You must be logged in.");
  if (!auth.ok) return auth.response;
  const { supabase, userId } = auth;

  // RLS also enforces this at the database level (see supabase/migrations),
  // but scoping the query by user_id here keeps intent explicit and gives a
  // cleaner "not found" instead of relying solely on the policy silently
  // matching zero rows.
  const { error, count } = await supabase
    .from("saved_calculations")
    .delete({ count: "exact" })
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    console.error("Failed to delete calculation:", error.message);
    return errorResponse("Couldn't delete that calculation. Please try again.", 500);
  }

  if (!count) {
    return errorResponse("Calculation not found.", 404);
  }

  return NextResponse.json({ ok: true });
}
