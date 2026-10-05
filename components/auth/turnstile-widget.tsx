"use client";

import { useCallback, useEffect, useState } from "react";
import Script from "next/script";

declare global {
  interface Window {
    turnstile?: { reset: (widgetId?: string) => void };
    // Turnstile invokes a global callback by name; each form registers its own.
    [key: `onTurnstileSuccess${string}`]: ((token: string) => void) | undefined;
  }
}

/**
 * Owns the Turnstile token for one form. `callbackName` must be unique per
 * form and is the global function name the widget calls on success.
 */
export function useTurnstile(callbackName: `onTurnstileSuccess${string}`) {
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  useEffect(() => {
    window[callbackName] = (token: string) => setCaptchaToken(token);
    return () => {
      delete window[callbackName];
    };
  }, [callbackName]);

  // Turnstile tokens are single-use; clear ours and ask the widget for a fresh one.
  const resetCaptcha = useCallback(() => {
    setCaptchaToken(null);
    window.turnstile?.reset();
  }, []);

  return { captchaToken, resetCaptcha };
}

export function TurnstileWidget({ callbackName }: { callbackName: string }) {
  return (
    <>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />
      <div
        className="cf-turnstile"
        data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
        data-callback={callbackName}
        data-size="flexible"
      />
    </>
  );
}
