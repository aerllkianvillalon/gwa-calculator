import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeRedirect, withRestoreFlag } from "@/lib/security/safe-redirect";

/**
 * Supabase redirects here after email confirmation / password-reset links.
 * We exchange the one-time code for a session (server-side, via secure
 * cookies) and then send the person on to wherever they were headed.
 *
 * SECURITY: the `redirect` parameter is attacker-controllable (it lives in a
 * link), so it is validated to be a same-site path before use. Previously it
 * was concatenated onto the origin, which allowed `?redirect=@evil.com` to
 * produce `https://site.com@evil.com` (an open redirect).
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const redirectPath = safeRedirect(searchParams.get("redirect"));
  const restore = searchParams.get("restore") === "1" || searchParams.get("restore") === "true";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      // Expired / already-used link: send the person somewhere helpful instead
      // of silently continuing as if they were signed in.
      return NextResponse.redirect(new URL("/login?error=link_invalid", origin));
    }
  }

  return NextResponse.redirect(new URL(withRestoreFlag(redirectPath, restore), origin));
}
