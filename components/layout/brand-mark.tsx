/**
 * Brand lockup: paper-plane logo + two-line wordmark. The width is set by
 * "General Weighted Average"; the letters of "Calculator" are spread edge to
 * edge so both lines share the exact same left and right edges.
 * Shared by the site header and the menu drawer so they always match.
 */
export function BrandMark() {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element -- static SVG, no optimization needed */}
      <img src="/logo.svg" alt="" width={26} height={26} className="h-[26px] w-[26px] shrink-0" aria-hidden="true" />
      <span className="flex flex-col" aria-hidden="true">
        <span className="whitespace-nowrap font-sans text-[6.5px] font-semibold leading-none tracking-[0.01em] text-ink-500 sm:text-[7.5px]">
          General Weighted Average
        </span>
        <span className="mt-0.5 flex justify-between font-serif text-[14.5px] font-semibold leading-none text-ledger-900 sm:text-[17px]">
          {"Calculator".split("").map((ch, i) => (
            <span key={i}>{ch}</span>
          ))}
        </span>
      </span>
    </>
  );
}