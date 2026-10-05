import type { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { errorResponse } from "@/lib/api/responses";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

type RequireUserResult =
  | { ok: true; supabase: SupabaseServerClient; userId: string }
  | { ok: false; response: NextResponse };

/**
 * Resolves the signed-in user for a route handler, or builds the 401 response
 * to return immediately. Keeps the auth check identical across API routes.
 */
export async function requireUser(unauthorizedMessage: string): Promise<RequireUserResult> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return { ok: false, response: errorResponse(unauthorizedMessage, 401) };
  }
  return { ok: true, supabase, userId: data.user.id };
}
