"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PAGE_LINKS } from "@/components/layout/nav-links";
import { cn } from "@/lib/utils";

/** Centered page links for desktop. Hidden on phones, where the same links live in the menu drawer. */
export function HeaderLinks() {
  const pathname = usePathname();

  return (
    <nav aria-label="Pages" className="hidden items-center gap-2 md:flex">
      {PAGE_LINKS.map(({ href, label }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "text-ledger-900 underline decoration-2 underline-offset-8"
                : "text-ink-700 hover:text-ink-900"
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}