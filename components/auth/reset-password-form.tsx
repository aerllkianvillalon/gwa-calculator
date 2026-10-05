"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { TurnstileWidget, useTurnstile } from "@/components/auth/turnstile-widget";
import { validateNewPassword } from "@/lib/auth/password";

/** Step 1: request a password-reset email. */
export function RequestResetForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error" | "rate_limited">(
    "idle"
  );
  const { captchaToken, resetCaptcha } = useTurnstile("onTurnstileSuccess");

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
      resetCaptcha();
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <Input
        label="Email"
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <TurnstileWidget callbackName="onTurnstileSuccess" />

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

    const passwordError = validateNewPassword(password, confirmPassword);
    if (passwordError) {
      setStatus("error");
      setMessage(passwordError);
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