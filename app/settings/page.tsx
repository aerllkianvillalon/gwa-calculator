import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { UpdatePasswordForm } from "@/components/auth/reset-password-form";
import { Card } from "@/components/ui/card";
import { DeleteAccountSection } from "@/components/dashboard/delete-account-section";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/login?redirect=/settings");
  }

  return (
    <main className="mx-auto max-w-sm px-4 py-10 sm:py-14">
      <h1 className="font-serif text-2xl font-medium text-ink-900">Settings</h1>
      <p className="mt-1 text-sm text-ink-500">
        <Link href="/dashboard" className="underline">
          Back to saved GWAs
        </Link>
      </p>

      <div className="mt-6">
        <h2 className="font-serif text-lg font-medium text-ink-900">Email</h2>
        <div className="mt-3 w-full rounded-md border border-ink-100 bg-white px-3 py-2 text-sm text-ink-900">
          {data.user.email}
        </div>
      </div>

      <div className="mt-6">
        <h2 className="font-serif text-lg font-medium text-ink-900">Change password</h2>
        <div className="mt-3">
          <UpdatePasswordForm />
        </div>
      </div>

      <div className="mt-8 border-t border-ink-100 pt-6">
        <DeleteAccountSection />
      </div>
    </main>
  );
}
