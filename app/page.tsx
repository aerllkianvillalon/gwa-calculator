import Link from "next/link";
import { CalculatorApp } from "@/components/calculator/calculator-app";
import { getCurrentUser } from "@/lib/supabase/get-user";

export default async function HomePage() {
  const user = await getCurrentUser();

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
      <header className="mb-8">
        <div className="flex items-center justify-between gap-4">
          <p className="font-serif text-lg font-medium text-ledger-900">GWA Calculator</p>
          <nav aria-label="Account" className="flex gap-3 text-sm">
            {user ? (
              <Link href="/dashboard" className="text-ink-700 underline">
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-ink-700 underline">
                  Log in
                </Link>
                <Link href="/register" className="text-ink-700 underline">
                  Register
                </Link>
              </>
            )}
          </nav>
        </div>

        <h1 className="mt-6 font-serif text-3xl font-medium leading-tight text-ink-900 sm:text-4xl">
          Calculate your General Weighted Average
        </h1>
        <p className="mt-3 max-w-xl text-ink-700">
          Add your subjects, units, and grades below to get your GWA right away. Built with the Philippine 1.00–5.00 numeric scale in mind, with other grading
          scales available if your school uses one of those instead.
        </p>
      </header>

      <CalculatorApp isAuthenticated={Boolean(user)} />

      <footer className="mt-12 border-t border-ink-100 pt-6 text-sm text-ink-500">
        <p>
          This tool estimates your General Weighted Average from the numbers you enter. It is not
          affiliated with any university and does not replace your registrar's official
          computation.
        </p>
        <p className="mt-2">
          <Link href="/privacy" className="underline">
            Privacy notice
          </Link>{" "}
          ·{" "}
          <a
            href="https://www.facebook.com/profile.php?id=61594447531796"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Questions? Contact us on Facebook
          </a>
        </p>
      </footer>
    </main>
  );
}
