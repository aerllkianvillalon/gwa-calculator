"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";

function FitText({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    const parent = el?.parentElement;
    if (!el || !parent) return;

    const mq = window.matchMedia("(min-width: 768px)");

    function fit() {
      if (!el || !parent) return;
      if (mq.matches) {
        el.style.fontSize = "";
        return;
      }
      // Measure at a known size, then scale to the parent's width.
      el.style.fontSize = "100px";
      const textWidth = el.getBoundingClientRect().width;
      const available = parent.clientWidth;
      if (textWidth > 0 && available > 0) {
        const size = Math.min((100 * available) / textWidth, 64);
        el.style.fontSize = `${Math.floor(size * 10) / 10}px`;
      }
    }

    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(parent);
    mq.addEventListener("change", fit);
    // Re-fit once web fonts finish loading, because they change the text width.
    document.fonts?.ready.then(fit);

    return () => {
      observer.disconnect();
      mq.removeEventListener("change", fit);
    };
  }, []);

  return (
    <span
      ref={ref}
      // The clamp is only a first-paint guess for before the script runs.
      className={`block w-fit whitespace-nowrap text-[length:clamp(1.1rem,calc((100vw-2rem)/12),2.25rem)] md:w-auto md:text-[length:inherit] ${className}`}
    >
      {children}
    </span>
  );
}

export function CalculatorIntro() {
  return (
    <section className="mb-8 sm:mb-10">
      <p className="mb-4 inline-flex max-w-full items-center gap-2 rounded-full border border-ledger-300 bg-ledger-100 px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] text-ledger-900">
        <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-ledger-500" />
        No sign-up needed
      </p>

      <h1 className="max-w-2xl font-serif text-4xl font-medium leading-[1.1] tracking-tight text-ink-900 sm:text-5xl md:text-balance md:leading-[1.08]">
        Calculate your{" "}
        <FitText className="text-ledger-700">General Weighted Average</FitText>
      </h1>

      <p className="mt-4 max-w-full text-pretty text-[length:clamp(1rem,4.4vw,1.125rem)] leading-relaxed text-ink-900 sm:mt-5 sm:max-w-xl sm:text-lg ">
        Add your subjects, units, and grades below to get your GWA right away. Built with the
        Philippine 1.00–5.00 numeric scale in mind, with other grading scales available if your
        school uses one of those instead.
      </p>
    </section>
  );
}