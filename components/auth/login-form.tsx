"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { safeRedirect, withRestoreFlag } from "@/lib/security/safe-redirect";
import { PasswordInput } from "@/components/ui/password-input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

declare global {
  interface Window {
    turnstile?: { reset: (widgetId?: string) => void };
    onTurnstileSuccessLogin?: (token: string) => void;
  }
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  useEffect(() => {
    window.onTurnstileSuccessLogin = (token: string) => setCaptchaToken(token);
    return () => {
      delete window.onTurnstileSuccessLogin;
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!captchaToken) {
      setStatus("error");
      setMessage("Please complete the verification challenge.");
      return;
    }

    setStatus("loading");
    setMessage(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
      options: { captchaToken },
    });

    if (error) {
      setStatus("error");
      setMessage("That email and password combination didn't work. Please try again.");
      setCaptchaToken(null);
      window.turnstile?.reset();
      return;
    }

    // Only ever navigate to a same-site path (blocks open-redirect links).
    const redirect = safeRedirect(searchParams.get("redirect"));
    const restore = searchParams.get("restore");
    router.push(withRestoreFlag(redirect, Boolean(restore)));
    router.refresh();
  }

  const linkError = searchParams.get("error") === "link_invalid";

  return (
    <>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        {linkError && (
          <Alert tone="warning">
            That link has expired or was already used. Log in, or request a new reset link.
          </Alert>
        )}
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
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div
          className="cf-turnstile"
          data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
          data-callback="onTurnstileSuccessLogin"
          data-size="flexible"
        />

        {status === "error" && <Alert tone="error">{message}</Alert>}

        <Button type="submit" isLoading={status === "loading"}>
          Log in
        </Button>

        <p className="text-sm text-ink-500">
          <Link href="/reset-password" className="underline">
            Forgot your password?
          </Link>
        </p>
      </form>
    </>
  );
}