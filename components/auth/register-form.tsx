"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { safeRedirect, withRestoreFlag } from "@/lib/security/safe-redirect";
import { PasswordInput } from "@/components/ui/password-input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { TurnstileWidget, useTurnstile } from "@/components/auth/turnstile-widget";
import { validateNewPassword } from "@/lib/auth/password";

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const { captchaToken, resetCaptcha } = useTurnstile("onTurnstileSuccessRegister");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const passwordError = validateNewPassword(password, confirmPassword);
    if (passwordError) {
      setStatus("error");
      setMessage(passwordError);
      return;
    }
    if (!captchaToken) {
      setStatus("error");
      setMessage("Please complete the verification challenge.");
      return;
    }

    setStatus("loading");
    setMessage(null);

    // Only ever navigate to a same-site path (blocks open-redirect links).
    const redirect = safeRedirect(searchParams.get("redirect"));
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
      resetCaptcha();
      return;
    }

    if (data.user && data.user.identities && data.user.identities.length === 0) {
      setStatus("error");
      setMessage("An account with that email already exists.");
      return;
    }

    const destination = withRestoreFlag(redirect, Boolean(restore));
    router.push(destination);
    router.refresh();
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

      <TurnstileWidget callbackName="onTurnstileSuccessRegister" />

      {status === "error" && <Alert tone="error">{message}</Alert>}

      <Button type="submit" isLoading={status === "loading"}>
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
  );
}