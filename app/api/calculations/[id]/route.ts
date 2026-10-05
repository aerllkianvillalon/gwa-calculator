import { NextResponse, type NextRequest } from "next/server";
import { requireUser } from "@/lib/api/require-user";
import { errorResponse } from "@/lib/api/responses";
import { isUuid } from "@/lib/validation/uuid";

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
