import { cn } from "@/lib/utils";

/** One label/value pair inside a `<dl>` result grid. */
export function Stat({
  label,
  value,
  tone = "text-ink-900",
}: {
  label: string;
  value: string;
  /** Tailwind text colour class for the value. */
  tone?: string;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-ink-500">{label}</dt>
      <dd className={cn("mt-0.5 font-serif text-2xl font-medium tabular", tone)}>{value}</dd>
    </div>
  );
}
