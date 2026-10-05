"use client";

import { useEffect, useState } from "react";
import { Download, Share, X } from "lucide-react";
import { useInstallPrompt } from "@/lib/hooks/use-install-prompt";

const DISMISS_KEY = "install-dismissed";

/**
 * Floating "Install app" pill in the bottom-right corner, so installing doesn't depend on opening
 * the menu. Hidden once installed, and after the person dismisses it (for this tab only).
 * Sits below the menu drawer's overlay (z-40 vs z-50), so it never competes with an open menu.
 */
export function FloatingInstall() {
  const { installed, canPrompt, isIos, install } = useInstallPrompt();
  const [dismissed, setDismissed] = useState(true); // hidden until we've checked
  const [showIosSteps, setShowIosSteps] = useState(false);

  useEffect(() => {
    try {
      setDismissed(window.sessionStorage.getItem(DISMISS_KEY) === "1");
    } catch {
      setDismissed(false);
    }
  }, []);

  function dismiss() {
    setDismissed(true);
    try {
      window.sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // Storage unavailable: it just stays dismissed until the next page load.
    }
  }

  if (installed || dismissed || (!canPrompt && !isIos)) return null;

  return (
    <div className="no-print fixed bottom-4 right-4 z-40 flex flex-col items-end gap-2 pb-[env(safe-area-inset-bottom)]">
      {isIos && showIosSteps && (
        <p
          role="status"
          className="flex max-w-[16rem] items-start gap-2.5 rounded-lg border border-ink-100 bg-paper-raised p-3 text-xs text-ink-500 shadow-lg"
        >
          <Share className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>
            Tap <strong className="font-medium text-ink-900">Share</strong>, then{" "}
            <strong className="font-medium text-ink-900">Add to Home Screen</strong>.
          </span>
        </p>
      )}
      <div className="flex items-center rounded-full border border-ink-100 bg-paper-raised shadow-lg">
        <button
          type="button"
          onClick={canPrompt ? install : () => setShowIosSteps((v) => !v)}
          aria-expanded={isIos && !canPrompt ? showIosSteps : undefined}
          className="inline-flex items-center gap-2 rounded-full py-2.5 pl-4 pr-3 text-sm font-medium text-ledger-900 transition-colors hover:bg-ledger-100"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          Install app
        </button>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss install prompt"
          className="mr-1 inline-flex h-8 w-8 items-center justify-center rounded-full text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-900"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
