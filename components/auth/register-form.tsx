"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Script from "next/script";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

declare global {
  interface Window {
    turnstile?: { reset: (widgetId?: string) => void };
    onTurnstileSuccessRegister?: (token: string) => void;
  }
}

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  useEffect(() => {
    window.onTurnstileSuccessRegister = (token: string) => setCaptchaToken(token);
    return () => {
      delete window.onTurnstileSuccessRegister;
    };
  }, []);

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
    if (!captchaToken) {
      setStatus("error");
      setMessage("Please complete the verification challenge.");
      return;
    }

    setStatus("loading");
    setMessage(null);

    const redirect = searchParams.get("redirect") ?? "/dashboard";
    const restore = searchParams.get("restore");
    const supabase = createClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?redirect=${encodeURIComponent(
          redirect
        )}${restore ? "&restore=1" : ""}`,
        captchaToken,
      },
    });

    if (error) {
      console.error("Supabase signUp error:", error.message, error.status);
      setStatus("error");
      setMessage(
        error.message.toLowerCase().includes("already registered")
          ? "An account with that email already exists."
          : "We couldn't create your account. Please try again."
      );
      setCaptchaToken(null);
      window.turnstile?.reset();
      return;
    }

    if (data.user && data.user.identities && data.user.identities.length === 0) {
      setStatus("error");
      setMessage("An account with that email already exists.");
      return;
    }

    const destination = restore ? `${redirect}?restore=1` : redirect;
    router.push(destination);
    router.refresh();
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
        <PasswordInput
          label="Password"
          autoComplete="new-password"
          required
          hint="At least 8 characters."
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <PasswordInput
          label="Confirm password"
          autoComplete="new-password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <div
          className="cf-turnstile"
          data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
          data-callback="onTurnstileSuccessRegister"
          data-size="flexible"
        />

        {status === "error" && <Alert tone="error">{message}</Alert>}

        <Button type="submit" isLoading={status === "loading"} disabled={!captchaToken}>
          Create account
        </Button>

        <p className="text-xs text-ink-500">
          We only ask for an email and password. See our{" "}
          <a href="/privacy" className="underline">
            privacy notice
          </a>{" "}
          for what we store.
        </p>
      </form>
    </>
  );
}