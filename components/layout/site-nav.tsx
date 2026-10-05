"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bookmark, LogIn, LogOut, Menu, Settings, UserPlus, X, type LucideIcon } from "lucide-react";
import { signOutAction } from "@/lib/auth/actions";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const SIGNED_IN_LINKS: NavItem[] = [
  { href: "/dashboard", label: "Saved GWAs", icon: Bookmark },
  { href: "/settings", label: "Settings", icon: Settings },
];

const menuItemBase =
  "flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-medium transition-colors";

export function SiteNav({
  isAuthenticated,
  userEmail,
}: {
  isAuthenticated: boolean;
  userEmail?: string | null;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Close the menu on route change, Escape, or a click/tap outside of it.
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      toggleRef.current?.focus(); // hand focus back so keyboard users don't lose their place
    };
    const onPointer = (e: MouseEvent | TouchEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("touchstart", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("touchstart", onPointer);
    };
  }, [open]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  const linkClass = (href: string) =>
    cn(
      menuItemBase,
      isActive(href)
        ? "bg-ledger-100 text-ledger-900"
        : "text-ink-700 hover:bg-ink-100 hover:text-ink-900"
    );

  // Log in is an action, not a section, so it never gets the "current page" highlight.
  const loginClass =
    "rounded-md px-3 py-2 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-100 hover:text-ink-900";

  // Signed-in people get the compact menu on every screen size; signed-out
  // visitors keep the inline Log in / Register links on desktop.
  const compactOnDesktop = isAuthenticated;

  return (
    <>
      {/* Desktop (signed-out only) */}
      {!compactOnDesktop && (
        <nav aria-label="Main" className="hidden items-center gap-1 sm:flex">
          <Link href="/login" className={loginClass}>
            Log in
          </Link>
          <Link
            href="/register"
            className="ml-1 rounded-md bg-ledger-700 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-ledger-hover"
          >
            Register
          </Link>
          <span className="mx-1 h-5 w-px bg-ink-100" aria-hidden="true" />
          <ThemeToggle />
        </nav>
      )}

      {/* Compact: always on phones; also on desktop when signed in */}
      <div
        ref={wrapperRef}
        className={cn("relative flex items-center gap-1", !compactOnDesktop && "sm:hidden")}
      >
        <ThemeToggle />
        <button
          ref={toggleRef}
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="site-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          className={cn(
            "inline-flex h-9 w-9 items-center justify-center rounded-md text-ink-700 transition-colors hover:bg-ink-100",
            open && "bg-ink-100"
          )}
        >
          {open ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
        </button>

        {open && (
          <nav
            id="site-menu"
            aria-label="Main"
            className="absolute right-0 top-full z-50 mt-3 w-[min(18rem,calc(100vw-2rem))] rounded-lg border border-ink-100 bg-paper-raised p-2 shadow-lg"
          >
            {isAuthenticated ? (
              <>
                {userEmail && (
                  <div className="px-3 pb-2 pt-1.5">
                    <p className="text-xs text-ink-500">Signed in as</p>
                    <p className="truncate text-sm font-medium text-ink-900" title={userEmail}>
                      {userEmail}
                    </p>
                  </div>
                )}
                <ul className="flex flex-col gap-0.5 border-t border-ink-100 pt-2">
                  {SIGNED_IN_LINKS.map(({ href, label, icon: Icon }) => (
                    <li key={href}>
                      <Link
                        href={href}
                        className={linkClass(href)}
                        aria-current={isActive(href) ? "page" : undefined}
                      >
                        <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
                <form action={signOutAction} className="mt-2 border-t border-ink-100 pt-2">
                  <button
                    type="submit"
                    className={cn(menuItemBase, "text-ink-700 hover:bg-ink-100 hover:text-ink-900")}
                  >
                    <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
                    Log out
                  </button>
                </form>
              </>
            ) : (
              <ul className="flex flex-col gap-1">
                <li>
                  <Link href="/login" className={cn(menuItemBase, loginClass)}>
                    <LogIn className="h-4 w-4 shrink-0" aria-hidden="true" />
                    Log in
                  </Link>
                </li>
                <li>
                  <Link
                    href="/register"
                    className={cn(
                      menuItemBase,
                      "justify-center bg-ledger-700 text-white hover:bg-ledger-hover"
                    )}
                  >
                    <UserPlus className="h-4 w-4 shrink-0" aria-hidden="true" />
                    Register
                  </Link>
                </li>
              </ul>
            )}
          </nav>
        )}
      </div>
    </>
  );
}