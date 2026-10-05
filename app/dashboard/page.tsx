import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Bookmark, Calculator, FileText, Layers, Plus, TrendingUp } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { SavedCalculationRow } from "@/types/database";
import { summarizeSavedCalculations } from "@/lib/calculator/saved-summary";
import { CalculationCard } from "@/components/dashboard/calculation-card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    redirect("/login?redirect=/dashboard");
  }

  // RLS ensures this query can only ever return rows owned by this user,
  // even though we don't filter by user_id explicitly here.
  const { data, error } = await supabase
    .from("saved_calculations")
    .select("*")
    .order("created_at", { ascending: false });

  const calculations = (data ?? []) as SavedCalculationRow[];

  const { totalUnits, cumulativeGwa } = summarizeSavedCalculations(calculations);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-medium text-ink-900">Your saved GWAs</h1>
          <p className="mt-1 text-sm text-ink-500">
            {calculations.length > 0
              ? "A record of every calculation you've saved."
              : "Calculations you save will show up here."}
          </p>
        </div>
        {calculations.length > 0 && (
          <Link href="/calculator">
            <Button type="button" variant="primary" size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" aria-hidden="true" />
              New calculation
            </Button>
          </Link>
        )}
      </div>

      {!error && calculations.length > 0 && (
        <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {cumulativeGwa !== null && (
            <div className="relative col-span-2 overflow-hidden rounded-lg border border-ledger-300 bg-ledger-100 p-5 sm:col-span-1 sm:order-first">
              <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-ledger-900/70">
                <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
                Cumulative GWA
              </dt>
              <dd className="mt-2 font-serif text-4xl font-medium tabular text-ledger-900">
                {cumulativeGwa.toFixed(2)}
              </dd>
            </div>
          )}
          <div className="rounded-lg border border-ink-100 bg-paper-raised p-5">
            <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-ink-500">
              <Bookmark className="h-3.5 w-3.5" aria-hidden="true" />
              Saved
            </dt>
            <dd className="mt-2 font-serif text-3xl font-medium tabular text-ink-900">
              {calculations.length}
            </dd>
          </div>
          <div className="rounded-lg border border-ink-100 bg-paper-raised p-5">
            <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-ink-500">
              <Layers className="h-3.5 w-3.5" aria-hidden="true" />
              Total units
            </dt>
            <dd className="mt-2 font-serif text-3xl font-medium tabular text-ink-900">
              {totalUnits}
            </dd>
          </div>
        </dl>
      )}

      {error && (
        <p className="mt-6 text-sm text-danger-600">
          Couldn't load your saved calculations right now. Please refresh the page.
        </p>
      )}

      {!error && calculations.length === 0 && (
        <div className="mt-8 flex flex-col items-center gap-4 rounded-lg border border-dashed border-ink-300/60 bg-paper-raised px-8 py-14 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-ledger-100 text-ledger-700">
            <FileText className="h-7 w-7" aria-hidden="true" />
          </span>
          <div>
            <p className="font-serif text-xl font-medium text-ink-900">You haven't saved a GWA yet.</p>
            <p className="mx-auto mt-1.5 max-w-sm text-sm text-ink-500">
              Calculate your GWA and save it here to keep a record you can come back to.
            </p>
          </div>
          <Link href="/calculator" className="mt-1">
            <Button type="button" variant="primary" size="md" className="gap-2">
              <Calculator className="h-4 w-4" aria-hidden="true" />
              Calculate your GWA
            </Button>
          </Link>
        </div>
      )}

      {calculations.length > 0 && (
        <h2 className="mt-10 text-xs font-medium uppercase tracking-wide text-ink-500">
          History
        </h2>
      )}
      <div className="mt-3 flex flex-col gap-4">
        {calculations.map((calc) => (
          <CalculationCard key={calc.id} calculation={calc} />
        ))}
      </div>
    </main>
  );
}