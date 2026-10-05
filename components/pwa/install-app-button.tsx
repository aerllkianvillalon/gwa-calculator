"use client";

import { useEffect, useState } from "react";
import { Download, Share } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/**
 * "Install app" row for the menu. Chrome/Edge/Android: triggers the native install prompt.
 * iPhone/iPad Safari has no prompt API, so it shows the Share -> Add to Home Screen steps.
 * Renders nothing when already installed or when installing isn't possible.
 */
export function InstallAppButton({ className }: { className?: string }) {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIos, setIsIos] = useState(false);
  const [installed, setInstalled] = useState(true); // hidden until we know otherwise

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
    setInstalled(standalone);
    setIsIos(/iphone|ipad|ipod/i.test(navigator.userAgent));

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed) return null;

  if (deferred) {
    return (
      <button
        type="button"
        className={className}
        onClick={async () => {
          await deferred.prompt();
          await deferred.userChoice;
          setDeferred(null);
        }}
      >
        <Download className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
        Install app
      </button>
    );
  }

  if (isIos) {
    return (
      <p className="flex items-start gap-3 px-3 py-2 text-xs text-ink-500">
        <Share className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <span>
          To install, tap <strong className="font-medium text-ink-700">Share</strong>, then{" "}
          <strong className="font-medium text-ink-700">Add to Home Screen</strong>.
        </span>
      </p>
    );
  }

  return null;
}
