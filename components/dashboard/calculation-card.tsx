import { CalendarDays, ChevronDown } from "lucide-react";
import type { SavedCalculationRow } from "@/types/database";
import { Card } from "@/components/ui/card";
import { getGradingSystem } from "@/lib/calculator/grading-systems";
import { CalculationActions } from "@/components/dashboard/calculation-actions";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function CalculationCard({ calculation }: { calculation: SavedCalculationRow }) {
  const gradingSystem = getGradingSystem(calculation.grading_system_id);
  const chips = [calculation.semester, calculation.academic_year, calculation.school_or_program].filter(
    Boolean
  ) as string[];

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <div className="flex items-start gap-4 p-5">
        {/* GWA tile, leading edge */}
        <div
          className="flex h-[4.5rem] w-[4.5rem] shrink-0 flex-col items-center justify-center rounded-lg border border-ledger-300 bg-ledger-100 text-ledger-900"
          aria-label={`GWA ${calculation.gwa.toFixed(2)}`}
        >
          <span className="font-serif text-2xl font-medium leading-none tabular">
            {calculation.gwa.toFixed(2)}
          </span>
          <span className="mt-1 text-[10px] font-medium uppercase tracking-widest text-ledger-900/70">
            GWA
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate font-serif text-lg font-medium leading-snug text-ink-900">
            {calculation.name || "Untitled calculation"}
          </p>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-ink-500">
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
              {formatDate(calculation.created_at)}
            </span>
            <span aria-hidden="true">·</span>
            <span className="tabular">{calculation.total_units} units</span>
            <span aria-hidden="true">·</span>
            <span>
              {calculation.subjects.length} subject{calculation.subjects.length === 1 ? "" : "s"}
            </span>
          </p>
          {chips.length > 0 && (
            <ul className="mt-2.5 flex flex-wrap gap-1.5">
              {chips.map((chip) => (
                <li
                  key={chip}
                  className="rounded-full bg-ink-100 px-2.5 py-0.5 text-xs font-medium text-ink-700"
                >
                  {chip}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <details className="group border-t border-ink-100">
        <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-3 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-100/50 [&::-webkit-details-marker]:hidden">
          <span>
            Breakdown
            <span className="ml-2 font-normal text-ink-500">
              {gradingSystem.label}
            </span>
          </span>
          <ChevronDown
            className="h-4 w-4 text-ink-500 transition-transform group-open:rotate-180"
            aria-hidden="true"
          />
        </summary>
        <div className="px-5 pb-4">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-ink-100 text-xs uppercase tracking-wide text-ink-500">
                <th scope="col" className="py-2 pr-2 font-medium">Subject</th>
                <th scope="col" className="py-2 pr-2 text-right font-medium">Units</th>
                <th scope="col" className="py-2 text-right font-medium">Grade</th>
              </tr>
            </thead>
            <tbody>
              {calculation.subjects.map((s) => (
                <tr key={s.id} className="border-b border-ink-100 last:border-b-0">
                  <td className="py-2 pr-2 text-ink-900">{s.name}</td>
                  <td className="py-2 pr-2 text-right tabular text-ink-700">{s.units}</td>
                  <td className="py-2 text-right font-medium tabular text-ink-900">
                    {s.grade.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>

      <div className="border-t border-ink-100 bg-paper/60 px-3 py-2">
        <CalculationActions calculation={calculation} />
      </div>
    </Card>
  );
}