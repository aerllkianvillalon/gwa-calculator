import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = { title: "Create account" };

export default function RegisterPage() {
  return (
    <main className="mx-auto max-w-sm px-4 py-14">
      <h1 className="font-serif text-2xl font-medium text-ink-900">Create your account</h1>
      <p className="mt-1 text-sm text-ink-500">
        Only needed if you want to save calculations for later.
      </p>
      <div className="mt-6">
        <Suspense>
          <RegisterForm />
        </Suspense>
      </div>
      <p className="mt-6 text-sm text-ink-500">
        Already have an account?{" "}
        <Link href="/login" className="underline">
          Log in
        </Link>
      </p>
    </main>
  );
}
