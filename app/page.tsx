import { CalculatorApp } from "@/components/calculator/calculator-app";
import { CalculatorIntro } from "@/components/calculator/calculator-intro";
import { getCurrentUser } from "@/lib/supabase/get-user";

export default async function HomePage() {
  const user = await getCurrentUser();

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
      <CalculatorIntro />

      {/* Invisible anchor: the intro's "Start calculating" button scrolls here. */}
      <div id="calculator" className="scroll-mt-20">
        <CalculatorApp isAuthenticated={Boolean(user)} />
      </div>
    </main>
  );
}