export function CalculatorIntro() {
  return (
    <section className="mb-8 sm:mb-10">
      <p className="mb-4 inline-flex max-w-full items-center gap-2 rounded-full border border-ledger-300 bg-ledger-100 px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] text-ledger-900">
        <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-ledger-500" />
        No sign-up needed
      </p>

      {/* Mobile: two fixed lines, with the font scaled to the screen width so the long second
          line never overflows. From sm up it flows as one heading, as before. */}
      <h1 className="max-w-2xl font-serif text-[length:clamp(1.25rem,6.2vw,2.25rem)] font-medium leading-[1.15] tracking-tight text-ink-900 sm:text-balance sm:text-5xl sm:leading-[1.08]">
        Calculate your <br className="sm:hidden" />
        <span className="relative whitespace-nowrap text-ledger-700">General Weighted Average</span>
      </h1>

      <p className="mt-4 max-w-xl text-pretty text-[length:clamp(0.875rem,3.9vw,1rem)] leading-relaxed text-ink-900 sm:mt-5 sm:text-lg">
        Add your subjects, units, and grades below to get your GWA right away. Built with the
        Philippine 1.00–5.00 numeric scale in mind, with other grading scales available if your
        school uses one of those instead.
      </p>
    </section>
  );
}