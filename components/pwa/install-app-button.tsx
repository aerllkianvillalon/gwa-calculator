"use client";

import { ChevronRight, Download, Share } from "lucide-react";
import { useInstallPrompt } from "@/lib/hooks/use-install-prompt";

/**
 * "Install app" row for the menu. Chrome/Edge/Android: triggers the native install prompt.
 * iPhone/iPad Safari has no prompt API, so it shows the Share -> Add to Home Screen steps.
 * Renders nothing when already installed or when installing isn't possible.
 */
export function InstallAppButton({ className }: { className?: string }) {
  const { installed, canPrompt, isIos, install } = useInstallPrompt();

  if (installed) return null;

  let content;

  if (canPrompt) {
    content = (
      <button type="button" className={className} onClick={install}>
        <Download className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
        <span className="flex-1 text-left">Install app</span>
        <ChevronRight
          className="h-4 w-4 text-ink-300 transition-transform group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      </button>
    );
  } else if (isIos) {
    content = (
      <p className="flex items-start gap-3 px-3 py-2 text-xs text-ink-500">
        <Share className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <span>
          To install, tap <strong className="font-medium text-ink-700">Share</strong>, then{" "}
          <strong className="font-medium text-ink-700">Add to Home Screen</strong>.
        </span>
      </p>
    );
  } else {
    return null;
  }

  return (
    <section aria-label="Install app">
      <p className="pb-1.5 text-[11px] font-medium uppercase tracking-wider text-ink-500">Install</p>
      {content}
    </section>
  );
}
