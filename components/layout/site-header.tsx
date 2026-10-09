import Link from "next/link";
import { getCurrentUser } from "@/lib/supabase/get-user";
import { SiteNav } from "@/components/layout/site-nav";
import { HeaderLinks } from "@/components/layout/header-links";

/** Brand mark: the paper-plane SVG from /public/logo.svg (same artwork as the favicon). */
function LogoMark() {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- static SVG, no optimization needed
    <img src="/logo.svg" alt="" width={32} height={32} className="h-8 w-8" aria-hidden="true" />
  );
}

export async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <header data-site-header className="sticky top-0 z-40 border-b border-ink-100 bg-paper-raised/90 backdrop-blur supports-[backdrop-filter]:bg-paper-raised/80">
      {/* Three columns on desktop so the page links sit in the true center. */}
      <div className="mx-auto grid max-w-5xl grid-cols-[1fr_auto] items-center gap-4 px-4 py-3 md:grid-cols-[1fr_auto_1fr]">
        <Link
          href="/"
          className="flex items-center gap-2.5 justify-self-start"
          aria-label="GWA Calculator home"
        >
          <LogoMark />
          <span className="font-serif text-lg font-medium text-ledger-900">GWA Calculator</span>
        </Link>
        <HeaderLinks />
        <div className="flex items-center justify-end gap-1 justify-self-end">
          <SiteNav isAuthenticated={Boolean(user)} userEmail={user?.email} />
        </div>
      </div>
    </header>
  );
}
