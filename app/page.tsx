import { CalculatorApp } from "@/components/calculator/calculator-app";
import { getCurrentUser } from "@/lib/supabase/get-user";

export default async function HomePage() {
  const user = await getCurrentUser();

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
      <section className="mb-8">
        <h1 className="font-serif text-3xl font-medium leading-tight text-ink-900 sm:text-4xl">
          Calculate your General Weighted Average
        </h1>
        <p className="mt-3 max-w-xl text-ink-700">
          Add your subjects, units, and grades below to get your GWA right away. Built with the
          Philippine 1.00–5.00 numeric scale in mind, with other grading scales available if your
          school uses one of those instead.
        </p>
      </section>

      <CalculatorApp isAuthenticated={Boolean(user)} />
    </main>
  );
}
