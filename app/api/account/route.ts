import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit } from "@/lib/rate-limit";
import { requireUser } from "@/lib/api/require-user";
import { errorResponse } from "@/lib/api/responses";

export async function DELETE(_request: NextRequest) {
  const auth = await requireUser("You must be logged in.");
  if (!auth.ok) return auth.response;
  const { supabase, userId } = auth;

  const rateLimit = checkRateLimit(`delete-account:${userId}`, 3, 60_000);
  if (!rateLimit.allowed) {
    return errorResponse("Please wait a moment and try again.", 429);
  }

  const admin = createAdminClient();

  // saved_calculations rows are removed automatically via ON DELETE CASCADE
  // (see supabase/migrations), so deleting the auth user is enough.
  const { error } = await admin.auth.admin.deleteUser(userId);

  if (error) {
    console.error("Failed to delete account:", error.message);
    return errorResponse("Couldn't delete your account right now. Please try again.", 500);
  }

  await supabase.auth.signOut();
  return NextResponse.json({ ok: true });
}
