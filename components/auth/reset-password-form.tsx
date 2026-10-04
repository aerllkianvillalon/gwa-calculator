"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

declare global {
  interface Window {
    turnstile?: {
      reset: (widgetId?: string) => void;
    };
    onTurnstileSuccess?: (token: string) => void;
  }
}

/** Step 1: request a password-reset email. */
export function RequestResetForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error" | "rate_limited">(
    "idle"
  );
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.onTurnstileSuccess = (token: string) => setCaptchaToken(token);
    return () => {
      delete window.onTurnstileSuccess;
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!captchaToken) {
      setStatus("error");
      return;
    }

    setStatus("loading");

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?redirect=/reset-password/confirm`,
      captchaToken,
    });

    if (error) {
      if (error.status === 429 || error.code === "over_email_send_rate_limit") {
        setStatus("rate_limited");
      } else {
        setStatus("error");
      }
      // Turnstile tokens are single-use; reset so the widget issues a fresh one.
      setCaptchaToken(null);
      window.turnstile?.reset();
    } else {
      // Always show the same success message whether or not the email exists,
      // so this form can't be used to enumerate registered accounts.
      setStatus("sent");
    }
  }

  if (status === "sent") {
    return (
      <Alert tone="success">
        If an account exists for that email, we've sent a link to reset your password.
      </Alert>
    );
  }

  return (
    <>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div
          ref={widgetRef}
          className="cf-turnstile"
          data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
          data-callback="onTurnstileSuccess"
          data-size="flexible"
        />

        {status === "error" && (
          <Alert tone="error">Something went wrong. Please try again in a moment.</Alert>
        )}
        {status === "rate_limited" && (
          <Alert tone="error">
            You've requested this too many times. Please wait a bit before trying again.
          </Alert>
        )}

        <Button type="submit" isLoading={status === "loading"}>
          Send reset link
        </Button>
      </form>
    </>
  );
}

/** Step 2: set a new password, reached via the emailed link. */
export function UpdatePasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (password.length < 8) {
      setStatus("error");
      setMessage("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setStatus("error");
      setMessage("Passwords don't match.");
      return;
    }

    setStatus("loading");
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setStatus("error");
      setMessage("Couldn't update your password. Try requesting a new reset link.");
      return;
    }
    setStatus("done");
  }

  if (status === "done") {
    return <Alert tone="success">Your password has been updated. You can now log in.</Alert>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <PasswordInput
        label="New password"
        autoComplete="new-password"
        required
        hint="At least 8 characters."
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <PasswordInput
        label="Confirm new password"
        autoComplete="new-password"
        required
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />
      {status === "error" && <Alert tone="error">{message}</Alert>}
      <Button type="submit" isLoading={status === "loading"}>
        Update password
      </Button>
    </form>
  );
}