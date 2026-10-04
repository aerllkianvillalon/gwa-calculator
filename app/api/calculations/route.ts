import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { saveCalculationSchema } from "@/lib/validation/schemas";
import { calculateGwa } from "@/lib/calculator/gwa";
import { getGradingSystem } from "@/lib/calculator/grading-systems";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    return NextResponse.json({ message: "You must be logged in to save a calculation." }, {
      status: 401,
    });
  }

  const rateLimit = checkRateLimit(`save-calculation:${userData.user.id}`, 20, 60_000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { message: "You're saving calculations too quickly. Please wait a moment and try again." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  const parsed = saveCalculationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 }
    );
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
    return NextResponse.json({ message: calc.message }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("saved_calculations")
    .insert({
      user_id: userData.user.id,
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
    return NextResponse.json(
      { message: "Couldn't save your calculation right now. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ id: data.id }, { status: 201 });
}
