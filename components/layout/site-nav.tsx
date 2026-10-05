"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bookmark,
  Calculator,
  ChevronRight,
  LogIn,
  LogOut,
  Menu,
  Settings,
  UserPlus,
  X,
  type LucideIcon,
} from "lucide-react";
import { signOutAction } from "@/lib/auth/actions";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { InstallAppButton } from "@/components/pwa/install-app-button";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const SIGNED_IN_LINKS: NavItem[] = [
  { href: "/calculator", label: "Calculator", icon: Calculator },
  { href: "/dashboard", label: "Saved GWAs", icon: Bookmark },
  { href: "/settings", label: "Settings", icon: Settings },
];

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function SiteNav({
  isAuthenticated,
  userEmail,
}: {
  isAuthenticated: boolean;
  userEmail?: string | null;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setMounted(true), []);

  const close = useCallback(() => setOpen(false), []);

  // Close on route change.
  useEffect(() => setOpen(false), [pathname]);

  // While open: Escape closes, Tab stays inside the drawer, page behind can't scroll.
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus(); // hand focus back so keyboard users keep their place
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const items = panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE);
      const first = items[0];
      const last = items[items.length - 1];
      if (!first || !last) return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  // Signed-in people get the drawer on every screen size; signed-out visitors
  // keep the inline Log in / Register links on desktop.
  const compactOnDesktop = isAuthenticated;

  const initial = (userEmail?.trim()[0] ?? "?").toUpperCase();

  const drawer = (
    <div
      className={cn("fixed inset-0 z-50", !open && "pointer-events-none")}
      aria-hidden={!open}
    >
      {/* Scrim */}
      <div
        onClick={close}
        className={cn(
          "absolute inset-0 bg-ink-900/40 backdrop-blur-[2px] transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0"
        )}
      />

      {/* Panel: slides in from the right edge, moving left */}
      <nav
        ref={panelRef}
        id="site-menu"
        aria-label="Main"
        className={cn(
          "absolute inset-y-0 right-0 flex w-[min(20rem,86vw)] flex-col border-l border-ink-100 bg-paper-raised shadow-2xl",
          "transition-[transform,visibility] duration-300 ease-out will-change-transform",
          open ? "visible translate-x-0" : "invisible translate-x-full"
        )}
      >
        <div className="flex items-center justify-between border-b border-ink-100 px-5 py-3">
          <span className="font-serif text-lg font-medium text-ledger-900">Menu</span>
          <button
            ref={closeRef}
            type="button"
            onClick={close}
            aria-label="Close menu"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-ink-700 transition-colors hover:bg-ink-100"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4">
          {isAuthenticated ? (
            <>
              {userEmail && (
                <div className="mb-4 flex items-center gap-3 rounded-lg bg-ledger-100 px-3 py-3">
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ledger-700 text-base font-semibold text-white"
                    aria-hidden="true"
                  >
                    {initial}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs text-ink-500">Signed in as</p>
                    <p className="truncate text-sm font-medium text-ink-900" title={userEmail}>
                      {userEmail}
                    </p>
                  </div>
                </div>
              )}
              <ul className="flex flex-col gap-1">
                {SIGNED_IN_LINKS.map(({ href, label, icon: Icon }) => {
                  const active = isActive(href);
                  return (
                    <li key={href}>
                      <Link
                        href={href}
                        onClick={close}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "group relative flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium transition-colors",
                          active
                            ? "bg-ledger-100 text-ledger-900"
                            : "text-ink-700 hover:bg-ink-100 hover:text-ink-900"
                        )}
                      >
                        {active && (
                          <span
                            className="absolute inset-y-2 left-0 w-1 rounded-full bg-ledger-700"
                            aria-hidden="true"
                          />
                        )}
                        <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
                        <span className="flex-1">{label}</span>
                        <ChevronRight
                          className="h-4 w-4 text-ink-300 transition-transform group-hover:translate-x-0.5"
                          aria-hidden="true"
                        />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </>
          ) : (
            <ul className="flex flex-col gap-2">
              <li>
                <Link
                  href="/login"
                  onClick={close}
                  className="flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-100 hover:text-ink-900"
                >
                  <LogIn className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
                  Log in
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  onClick={close}
                  className="flex items-center gap-3 rounded-md bg-ledger-700 px-3 py-3 text-sm font-medium text-white transition-colors hover:bg-ledger-hover"
                >
                  <UserPlus className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
                  Register
                </Link>
              </li>
            </ul>
          )}

          <div className="mt-2 border-t border-ink-100 pt-2 empty:hidden">
            <InstallAppButton className="flex w-full items-center gap-3 rounded-md px-3 py-3 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-100 hover:text-ink-900" />
          </div>
        </div>

        {isAuthenticated && (
          <form action={signOutAction} className="border-t border-ink-100 p-3">
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-md px-3 py-3 text-sm font-medium text-ink-700 transition-colors hover:bg-danger-100 hover:text-danger-600"
            >
              <LogOut className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
              Log out
            </button>
          </form>
        )}
      </nav>
    </div>
  );

  return (
    <>
      {/* Desktop (signed-out only) */}
      {!compactOnDesktop && (
        <nav aria-label="Main" className="hidden items-center gap-1 sm:flex">
          <Link
            href="/login"
            className="rounded-md px-3 py-2 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-100 hover:text-ink-900"
          >
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
      <div className={cn("flex items-center gap-1", !compactOnDesktop && "sm:hidden")}>
        <ThemeToggle />
        <button
          ref={toggleRef}
          type="button"
          onClick={() => setOpen(true)}
          aria-expanded={open}
          aria-controls="site-menu"
          aria-label="Open menu"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md text-ink-700 transition-colors hover:bg-ink-100"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      {/* Portaled to <body>: the header's backdrop-blur would otherwise trap a fixed child inside the header. */}
      {mounted && createPortal(drawer, document.body)}
    </>
  );
}
