"use client";

import { useCallback, useEffect, useRef, useState, type TouchEvent } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronRight,
  LogIn,
  Menu,
  Settings,
  UserPlus,
  X,
  type LucideIcon,
} from "lucide-react";
import { LogoutButton } from "@/components/auth/logout-button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { InstallAppButton } from "@/components/pwa/install-app-button";
import { BrandMark } from "@/components/layout/brand-mark";
import { PAGE_LINKS } from "@/components/layout/nav-links";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

// Page links (Calculator, Saved Calculations, Privacy, ...) live in the header on desktop and in
// the drawer on phones; account-only links stay in the drawer on every screen size.
const SIGNED_IN_LINKS: NavItem[] = [{ href: "/settings", label: "Settings", icon: Settings }];

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
  // Swipe-to-close (phones): how far the panel is currently dragged to the right, or null if idle.
  const [dragX, setDragX] = useState<number | null>(null);
  const touchStart = useRef<{ x: number; y: number; horizontal: boolean | null } | null>(null);

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

  function onTouchStart(e: TouchEvent) {
    const t = e.touches[0];
    if (t) touchStart.current = { x: t.clientX, y: t.clientY, horizontal: null };
  }

  function onTouchMove(e: TouchEvent) {
    const start = touchStart.current;
    const t = e.touches[0];
    if (!start || !t) return;
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    // Decide once per gesture: mostly-horizontal drags move the panel; vertical ones scroll it.
    if (start.horizontal === null && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
      start.horizontal = Math.abs(dx) > Math.abs(dy);
    }
    if (start.horizontal) setDragX(Math.max(0, dx));
  }

  function onTouchEnd() {
    const dragged = dragX ?? 0;
    const width = panelRef.current?.offsetWidth ?? 320;
    touchStart.current = null;
    setDragX(null);
    if (dragged > Math.min(90, width * 0.3)) close();
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  const initial = (userEmail?.trim()[0] ?? "U").toUpperCase();

  const renderLink = ({ href, label, icon: Icon }: NavItem) => {
    const active = isActive(href);
    return (
      <li key={href}>
        <Link
          href={href}
          onClick={close}
          aria-current={active ? "page" : undefined}
          className={cn(
            "group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors",
            active
              ? "bg-ledger-100/70 font-semibold text-ledger-900"
              : "font-medium text-ink-700 hover:bg-ink-100 hover:text-ink-900"
          )}
        >
          <Icon
            className={cn("h-[18px] w-[18px] shrink-0", active ? "text-ledger-700" : "text-ink-500")}
            aria-hidden="true"
          />
          <span className="flex-1">{label}</span>
          <ChevronRight
            className="h-4 w-4 text-ink-300 transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </Link>
      </li>
    );
  };

  const sectionLabel = "pb-1.5 text-[11px] font-medium uppercase tracking-wider text-ink-500";

  const drawer = (
    <div
      className={cn("fixed inset-0 z-50", !open && "pointer-events-none")}
      inert={!open}
    >
      {/* Scrim */}
      <div
        onClick={close}
        className={cn(
          "absolute inset-0 bg-ink-900/40 backdrop-blur-[2px] transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0"
        )}
      />

      {/* Panel: slides in from the right edge, moving left; swipe it right to close */}
      <nav
        ref={panelRef}
        id="site-menu"
        aria-label="Main"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onTouchCancel={onTouchEnd}
        style={dragX ? { transform: `translateX(${dragX}px)` } : undefined}
        className={cn(
          "absolute inset-y-0 right-0 flex w-[min(20rem,86vw)] flex-col border-l border-ink-100 bg-paper-raised shadow-2xl",
          "transition-[transform,visibility] duration-300 ease-out will-change-transform",
          dragX !== null && "transition-none",
          open ? "visible translate-x-0" : "invisible translate-x-full"
        )}
      >
        {/* Top: who you are (signed in) or the brand (signed out), plus close */}
        <div className="px-3">
          <div className="flex items-center gap-3 border-b border-ink-100 px-1 py-3.5">
            {isAuthenticated ? (
              <>
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ledger-700 text-base font-semibold text-white"
                  aria-hidden="true"
                >
                  {initial}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-ink-500">Signed in as</p>
                  <p className="truncate text-sm font-medium text-ink-900" title={userEmail ?? undefined}>
                    {userEmail ?? "Your account"}
                  </p>
                </div>
              </>
            ) : (
              <div className="flex min-w-0 flex-1 items-center gap-2.5">
                {/* eslint-disable-next-line @next/next/no-img-element -- static SVG */}
                <BrandMark />
              </div>
            )}
            <button
              ref={closeRef}
              type="button"
              onClick={close}
              aria-label="Close menu"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-ink-700 transition-colors hover:bg-ink-100"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-3 py-4">
          {!isAuthenticated && (
            <section aria-label="Account">
              <p className={sectionLabel}>Account</p>
              <ul className="flex flex-col gap-1.5">
                <li>
                  <Link
                    href="/register"
                    onClick={close}
                    className="flex items-center gap-3 rounded-md bg-ledger-700 px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-ledger-hover"
                  >
                    <UserPlus className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
                    Register
                  </Link>
                </li>
                <li>
                  <Link
                    href="/login"
                    onClick={close}
                    className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-100 hover:text-ink-900"
                  >
                    <LogIn className="h-[18px] w-[18px] shrink-0 text-ink-500" aria-hidden="true" />
                    Log in
                  </Link>
                </li>
              </ul>
              <p className="mt-3 text-sm text-ink-500">
                Create a free account to save your GWAs and edit them later.
              </p>
            </section>
          )}

          {/* Page links are listed here on every screen size (and also in the header on desktop). */}
          <section aria-label="Pages">
            <p className={sectionLabel}>Pages</p>
            <ul className="flex flex-col gap-0.5">{PAGE_LINKS.map(renderLink)}</ul>
          </section>

          <InstallAppButton
            className="group flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-100 hover:text-ink-900"
          />

          {isAuthenticated && (
            <section aria-label="Account">
              <p className={sectionLabel}>Account</p>
              <ul className="flex flex-col gap-0.5">{SIGNED_IN_LINKS.map(renderLink)}</ul>
            </section>
          )}
        </div>

        {/* Bottom: log out. Hidden when signed out. */}
        <div className="px-3">
          <div className="flex flex-col gap-1 border-t border-ink-100 px-1 py-3 empty:hidden">
            {isAuthenticated && (
              <LogoutButton />
            )}
          </div>
        </div>
      </nav>
    </div>
  );

  return (
    <>
      {/* Same header controls for everyone: theme toggle + hamburger. Log in / Register live in the menu. */}
      <div className="flex items-center gap-1">
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