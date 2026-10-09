export function CalculatorIntro() {
  return (
    <section className="mb-10">
      <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-ledger-300 bg-ledger-100 px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] text-ledger-900">
        <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-ledger-500" />
        No sign-up needed
      </p>

      <h1 className="max-w-2xl text-balance font-serif text-4xl font-medium leading-[1.08] tracking-tight text-ink-900 sm:text-5xl">
        Calculate your{" "}
        <span className="relative whitespace-nowrap text-ledger-700">
          General Weighted Average
        </span>
      </h1>

      <p className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-ink-900 sm:text-lg">
        Add your subjects, units, and grades below to get your GWA right away. Built with the
        Philippine 1.00–5.00 numeric scale in mind, with other grading scales available if your
        school uses one of those instead.
      </p>
    </section>
  );
}