import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <main className="mx-auto max-w-sm px-4 py-14">
      <h1 className="font-serif text-2xl font-medium text-ink-900">Log in</h1>
      <p className="mt-1 text-sm text-ink-500">
        Log in to see your saved GWA calculations.
      </p>
      <div className="mt-6">
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
