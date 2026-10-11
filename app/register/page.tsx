import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { RegisterForm } from "@/components/auth/register-form";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = { title: "Create account" };

export default function RegisterPage() {
  return (
    <main className="mx-auto max-w-md px-4 py-12 sm:py-16">
      <Card className="p-6 shadow-sm sm:p-8">
        <h1 className="font-serif text-2xl font-medium text-ink-900 sm:text-3xl">Create your account</h1>
        <p className="mt-1.5 text-sm text-ink-500">
          Only needed if you want to save calculations for later.
        </p>
        <div className="mt-6 border-t border-ink-100 pt-6">
          <Suspense>
            <RegisterForm />
          </Suspense>
        </div>
      </Card>
      <p className="mt-6 text-center text-sm text-ink-500">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-ledger-700 underline underline-offset-2">
          Log in
        </Link>
      </p>
    </main>
  );
}