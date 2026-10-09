import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About",
  description:
    "About the GWA Calculator: a free tool for estimating your General Weighted Average, built with Philippine college grading systems in mind.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:py-14">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ledger-700">About</p>
        <h1 className="mt-2 font-serif text-3xl font-semibold leading-tight text-ink-900 sm:text-4xl">
          A simpler way to work out your GWA
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-700">
          A free, no-fuss General Weighted Average calculator, built with Philippine college
          students in mind.
        </p>
      </header>

      <div className="mt-10 divide-y divide-ink-100 border-t border-ink-100 text-sm leading-relaxed text-ink-700">
        <section className="py-6">
          <h2 className="flex items-center gap-2.5 before:h-5 before:w-1 before:shrink-0 before:rounded-full before:bg-ledger-700 font-serif text-lg font-medium text-ink-900">What it does</h2>
          <p className="mt-2">
            Enter each subject with its units and grade, and the calculator works out your GWA as
            the sum of grade × units divided by total units. It supports the Philippine 1.00–5.00
            scale, a 0–100 percentage scale, and a 4.0 GPA scale.
          </p>
        </section>

        <section className="py-6">
          <h2 className="flex items-center gap-2.5 before:h-5 before:w-1 before:shrink-0 before:rounded-full before:bg-ledger-700 font-serif text-lg font-medium text-ink-900">Tools to plan ahead</h2>
          <ul className="mt-2 list-disc pl-5">
            <li>Set a target GWA and see how far you are from it.</li>
            <li>Try a what-if: change one grade and see how your GWA would move.</li>
            <li>
              Create a free account to save calculations, come back to them later, edit them, and
              see a cumulative GWA across everything you&apos;ve saved.
            </li>
          </ul>
        </section>

        <section className="py-6">
          <h2 className="flex items-center gap-2.5 before:h-5 before:w-1 before:shrink-0 before:rounded-full before:bg-ledger-700 font-serif text-lg font-medium text-ink-900">No account needed</h2>
          <p className="mt-2">
            You can calculate as a guest. Your subjects and grades stay in your browser unless you
            choose to save them. See the{" "}
            <Link href="/privacy" className="underline">
              privacy notice
            </Link>{" "}
            for the details.
          </p>
        </section>

        <section className="py-6">
          <h2 className="flex items-center gap-2.5 before:h-5 before:w-1 before:shrink-0 before:rounded-full before:bg-ledger-700 font-serif text-lg font-medium text-ink-900">
            A close estimate, not an official one
          </h2>
          <p className="mt-2">
            Schools differ in how they round, which subjects (like PE or NSTP) count toward the
            GWA, and where honors cutoffs sit. This tool isn&apos;t affiliated with any university
            and doesn&apos;t replace your registrar&apos;s official computation, so confirm anything
            important with them.
          </p>
        </section>
      </div>

      <div className="mt-2">
        <Link href="/calculator">
          <Button type="button">Open the calculator</Button>
        </Link>
      </div>
    </main>
  );
}