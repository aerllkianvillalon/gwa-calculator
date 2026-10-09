import { NextResponse, type NextRequest } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { requireUser } from "@/lib/api/require-user";
import { errorResponse } from "@/lib/api/responses";
import { parseCalculationPayload } from "@/lib/api/calculation-payload";

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

  const payload = await parseCalculationPayload(request);
  if (!payload.ok) return payload.response;

  const { data, error } = await supabase
    .from("saved_calculations")
    .insert({ user_id: userId, ...payload.columns })
    .select("id")
    .single();

  if (error) {
    // Log server-side for debugging; never leak database internals to the client.
    console.error("Failed to save calculation:", error.message);
    return errorResponse("Couldn't save your calculation right now. Please try again.", 500);
  }

  return NextResponse.json({ id: data.id }, { status: 201 });
}
