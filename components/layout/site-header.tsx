import Link from "next/link";
import { getCurrentUser } from "@/lib/supabase/get-user";
import { SiteNav } from "@/components/layout/site-nav";
import { BrandMark } from "@/components/layout/brand-mark";
import { HeaderLinks } from "@/components/layout/header-links";

export async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <header data-site-header className="sticky top-0 z-40 border-b border-ink-100 bg-paper-raised/90 backdrop-blur supports-[backdrop-filter]:bg-paper-raised/80">
      {/* Three columns on large screens so the page links sit in the true center. */}
      <div className="mx-auto grid max-w-5xl grid-cols-[1fr_auto] items-center gap-4 px-3 py-3 sm:px-4 lg:grid-cols-[1fr_auto_1fr]">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2 justify-self-start sm:gap-2.5"
          aria-label="General Weighted Average Calculator home"
        >
          <BrandMark />
        </Link>
        <HeaderLinks />
        <div className="flex items-center justify-end gap-1 justify-self-end">
          <SiteNav isAuthenticated={Boolean(user)} userEmail={user?.email} />
        </div>
      </div>
    </header>
  );
}