import Link from "next/link";
import { BrandMark } from "@/components/layout/brand-mark";
import { PAGE_LINKS } from "@/components/layout/nav-links";

const FACEBOOK_URL = "https://www.facebook.com/profile.php?id=61594447531796";

export function SiteFooter() {
  return (
    <footer data-site-footer className="mt-16 border-t border-ink-100 bg-paper-raised">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          {/* Brand + blurb */}
          <div className="max-w-xs">
            <Link href="/" className="flex items-center gap-2.5" aria-label="General Weighted Average Calculator home">
              <BrandMark />
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-ink-500">
              A free GWA calculator built with Philippine college students in mind.
            </p>
          </div>

          {/* Links */}
          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-12 gap-y-2.5 text-sm sm:grid-cols-3">
            {PAGE_LINKS.map(({ href, label }) => (
              <Link key={href} href={href} className="text-ink-700 transition-colors hover:text-ledger-700">
                {label}
              </Link>
            ))}
            <a
              href={FACEBOOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink-700 transition-colors hover:text-ledger-700"
            >
              Facebook
            </a>
          </nav>
        </div>

        {/* Disclaimer + copyright */}
        <div className="mt-8 flex flex-col gap-2 border-t border-ink-100 pt-6 text-xs leading-relaxed text-ink-500 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
          <p className="max-w-xl">
            This tool estimates your General Weighted Average from the numbers you enter. It is not
            affiliated with any university and does not replace your registrar&apos;s official
            computation.
          </p>
          <p className="shrink-0">&copy; {new Date().getFullYear()} General Weighted Average Calculator</p>
        </div>
      </div>
    </footer>
  );
}