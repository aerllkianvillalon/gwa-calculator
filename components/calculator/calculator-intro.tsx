/**
 * Intro block for the calculator pages.
 *
 * Sizing is pure CSS (see `.intro*` in globals.css), so it is correct on first
 * paint and never shifts after hydration or font load:
 *
 * - Below `md`, the section is a size container and the heading, its highlighted
 *   phrase and the paragraph all derive their font size from its width. They
 *   shrink together on small screens and when the browser is zoomed in.
 *   The heading is large (width / 9.5, max 3.5rem) and may wrap onto extra
 *   lines, so "General Weighted Average" can break after "Weighted".
 * - "Calculate your" and the highlighted phrase share the heading's font size.
 *   The phrase always starts on its own line.
 * - From `md` up, the original desktop sizes apply (`text-5xl` heading).
 */
export function CalculatorIntro() {
  return (
    <section className="intro mb-8 sm:mb-10">
      <p className="mb-4 inline-flex max-w-full items-center gap-2 rounded-full border border-ledger-300 bg-ledger-100 px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] text-ledger-900">
        <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-ledger-500" />
        No sign-up needed
      </p>

      <h1 className="intro-heading max-w-2xl font-serif font-medium leading-[1.1] tracking-tight text-ink-900 text-balance md:text-5xl md:leading-[1.08]">
        Calculate your{" "}
        <span className="block text-ledger-700">
          General Weighted Average
        </span>
      </h1>

      <p className="intro-text mt-4 max-w-full text-pretty leading-relaxed text-ink-900 sm:mt-5 md:max-w-xl md:text-lg">
        Add your subjects, units, and grades below to get your GWA right away. Built with the
        Philippine 1.00–5.00 numeric scale in mind, with other grading scales available if your
        school uses one of those instead.
      </p>
    </section>
  );
}