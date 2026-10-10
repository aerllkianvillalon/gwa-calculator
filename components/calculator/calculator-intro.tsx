import { BadgeCheck, Globe2, ShieldCheck } from "lucide-react";
import { IntroParticles } from "@/components/calculator/intro-particles";

const HIGHLIGHTS = [
  { icon: ShieldCheck, label: "No sign-up needed" },
  { icon: BadgeCheck, label: "Free to use" },
  { icon: Globe2, label: "1.00–5.00 scale and more", desktopOnly: true },
];

/**
 * Intro for the calculator pages. Centered, and wider than the page column (matches the
 * header width, up to 64rem) while the calculator below keeps its own width. No card: the
 * text sits directly on the page background over a neutral, interactive particle field
 * (`IntroParticles`, decorative only). Green is used only as a small accent. Colors are
 * theme tokens, so it follows light and dark mode. The fade-in is CSS-only (`.fade-up` in
 * globals.css) and disabled for reduced-motion users.
 */
export function CalculatorIntro() {
  return (
    <section className="relative isolate left-1/2 mb-6 w-[min(calc(100vw-2rem),64rem)] -translate-x-1/2 -mt-6 pb-3 pt-0 text-left sm:mt-0 sm:mb-10 sm:py-24 sm:text-center">
      <IntroParticles />

      <p
        className="fade-up mb-4 inline-flex max-w-full items-center gap-2 rounded-full border border-ink-100 bg-paper-raised px-3 py-1 text-xs font-medium text-ink-700 sm:mb-8 sm:px-4 sm:py-2 sm:text-base"
        style={{ animationDelay: "0ms" }}
      >
        <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-ledger-500" />
        Built with college students in mind
      </p>

      <h1
        className="fade-up mx-auto max-w-4xl text-balance font-serif text-[1.875rem] font-medium leading-[1.12] tracking-tight text-ink-900 min-[400px]:text-[2.125rem] sm:text-6xl sm:leading-[1.05] lg:text-7xl lg:leading-[1.03]"
        style={{ animationDelay: "80ms" }}
      >
        Calculate your <span className="text-ledger-700">General Weighted Average</span>
      </h1>

      <p
        className="fade-up mx-auto mt-3 max-w-2xl text-pretty text-sm leading-relaxed text-ink-500 sm:mt-8 sm:text-xl"
        style={{ animationDelay: "160ms" }}
      >
        Add your subjects, units and grades to get your GWA right away. Built for the Philippine
        1.00–5.00 scale, with other grading scales available if your school uses one.
      </p>

      <ul
        className="fade-up mt-5 flex flex-wrap gap-x-4 gap-y-2 sm:mt-10 sm:justify-center sm:gap-x-8 sm:gap-y-2.5"
        style={{ animationDelay: "240ms" }}
      >
        {HIGHLIGHTS.map(({ icon: Icon, label, desktopOnly }) => (
          <li
            key={label}
            className={`${desktopOnly ? "hidden sm:flex" : "flex"} items-center gap-1.5 text-xs font-medium text-ink-700 sm:gap-2 sm:text-base`}
          >
            <Icon className="h-3.5 w-3.5 text-ink-500 sm:h-5 sm:w-5" aria-hidden="true" />
            {label}
          </li>
        ))}
      </ul>
    </section>
  );
}