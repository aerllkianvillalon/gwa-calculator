"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { LogoutButton } from "@/components/auth/logout-button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
}

export function SiteNav({ isAuthenticated }: { isAuthenticated: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the mobile menu whenever the route changes or Escape is pressed.
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const links: NavItem[] = [
    ...(isAuthenticated
      ? [
          { href: "/dashboard", label: "Saved GWAs" },
          { href: "/settings", label: "Settings" },
        ]
      : []),
  ];

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  // Log in is an action, not a section, so it never gets the "current page" highlight.
  const loginClass =
    "rounded-md px-3 py-2 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-100 hover:text-ink-900";

  const linkClass = (href: string) =>
    cn(
      "rounded-md px-3 py-2 text-sm font-medium transition-colors",
      isActive(href)
        ? "bg-ledger-100 text-ledger-900"
        : "text-ink-700 hover:bg-ink-100 hover:text-ink-900"
    );

  // Signed-in people get the compact (hamburger) header on every screen size;
  // signed-out visitors keep the inline Log in / Register links on desktop.
  const compactOnDesktop = isAuthenticated;

  return (
    <>
      {/* Desktop (signed-out only) */}
      {!compactOnDesktop && (
        <nav aria-label="Main" className="hidden items-center gap-1 sm:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className={linkClass(l.href)} aria-current={isActive(l.href) ? "page" : undefined}>
              {l.label}
            </Link>
          ))}
          {!isAuthenticated && (
            <>
              <Link href="/login" className={loginClass}>
                Log in
              </Link>
              <Link
                href="/register"
                className="ml-1 rounded-md bg-ledger-700 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-ledger-hover"
              >
                Register
              </Link>
            </>
          )}
          <span className="mx-1 h-5 w-px bg-ink-100" aria-hidden="true" />
          <ThemeToggle />
        </nav>
      )}

      {/* Compact: always on phones; also on desktop when signed in */}
      <div className={cn("flex items-center gap-1", !compactOnDesktop && "sm:hidden")}>
        <ThemeToggle />
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md text-ink-700 hover:bg-ink-100"
        >
          {open ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
        </button>
      </div>

      {open && (
        <nav
          id="mobile-menu"
          aria-label="Main"
          className={cn(
            "absolute inset-x-0 top-full border-b border-ink-100 bg-paper-raised px-4 py-3 shadow-sm",
            !compactOnDesktop && "sm:hidden"
          )}
        >
          <ul className="mx-auto flex max-w-3xl flex-col gap-1">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className={cn("block", linkClass(l.href))} aria-current={isActive(l.href) ? "page" : undefined}>
                  {l.label}
                </Link>
              </li>
            ))}
            {!isAuthenticated ? (
              <>
                <li>
                  <Link href="/login" className={cn("block", loginClass)}>
                    Log in
                  </Link>
                </li>
                <li>
                  <Link
                    href="/register"
                    className="block rounded-md bg-ledger-700 px-3 py-2 text-center text-sm font-medium text-white hover:bg-ledger-hover"
                  >
                    Register
                  </Link>
                </li>
              </>
            ) : (
              <li className="pt-1">
                <LogoutButton />
              </li>
            )}
          </ul>
        </nav>
      )}
    </>
  );
}