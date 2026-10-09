"use client";

import type { GwaResult, GradingSystem } from "@/types/calculator";
import { Card } from "@/components/ui/card";

export function GwaSummary({
  result,
  gradingSystem,
}: {
  result: GwaResult;
  gradingSystem: GradingSystem;
}) {
  return (
    <Card className="p-5 sm:p-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-ink-500">Your GWA</p>
          <p className="font-serif text-5xl font-medium tabular text-ledger-900" aria-live="polite">
            {result.gwa.toFixed(2)}
          </p>
        </div>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-ink-700">
          <dt className="text-ink-500">Total units</dt>
          <dd className="tabular">{result.totalUnits}</dd>
          <dt className="text-ink-500">Subjects</dt>
          <dd className="tabular">{result.breakdown.length}</dd>
          <dt className="text-ink-500">Scale</dt>
          <dd>{gradingSystem.label}</dd>
        </dl>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[420px] text-left text-sm">
          <caption className="sr-only">Per-subject breakdown of the GWA calculation</caption>
          <thead>
            <tr className="border-b border-ink-100 text-ink-500">
              <th scope="col" className="py-2 pr-2 font-medium">
                Subject
              </th>
              <th scope="col" className="py-2 pr-2 font-medium">
                Units
              </th>
              <th scope="col" className="py-2 pr-2 font-medium">
                Grade
              </th>
              <th scope="col" className="py-2 pr-2 font-medium">
                Grade × units
              </th>
              <th scope="col" className="py-2 font-medium">
                Share
              </th>
            </tr>
          </thead>
          <tbody>
            {result.breakdown.map((row) => (
              <tr key={row.id} className="border-b border-ink-100 last:border-b-0">
                <td className="py-2 pr-2">{row.name}</td>
                <td className="py-2 pr-2 tabular">{row.units}</td>
                <td className="py-2 pr-2 tabular">{row.grade.toFixed(2)}</td>
                <td className="py-2 pr-2 tabular">{row.weightedPoints.toFixed(2)}</td>
                <td className="py-2 tabular">{row.contributionPercent.toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}