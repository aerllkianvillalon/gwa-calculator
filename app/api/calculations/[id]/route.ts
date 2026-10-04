import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Reject anything that isn't a UUID before it reaches the database.
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return NextResponse.json({ message: "Calculation not found." }, { status: 404 });
  }

  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    return NextResponse.json({ message: "You must be logged in." }, { status: 401 });
  }

  // RLS also enforces this at the database level (see supabase/migrations),
  // but scoping the query by user_id here keeps intent explicit and gives a
  // cleaner "not found" instead of relying solely on the policy silently
  // matching zero rows.
  const { error, count } = await supabase
    .from("saved_calculations")
    .delete({ count: "exact" })
    .eq("id", id)
    .eq("user_id", userData.user.id);

  if (error) {
    console.error("Failed to delete calculation:", error.message);
    return NextResponse.json(
      { message: "Couldn't delete that calculation. Please try again." },
      { status: 500 }
    );
  }

  if (!count) {
    return NextResponse.json({ message: "Calculation not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
