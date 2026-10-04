import Link from "next/link";
import { getCurrentUser } from "@/lib/supabase/get-user";
import { SiteNav } from "@/components/layout/site-nav";

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
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2.5" aria-label="GWA Calculator home">
          <LogoMark />
          <span className="font-serif text-lg font-medium text-ledger-900">GWA Calculator</span>
        </Link>
        <SiteNav isAuthenticated={Boolean(user)} />
      </div>
    </header>
  );
}
