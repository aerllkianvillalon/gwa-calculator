import Link from "next/link";
import { Pencil } from "lucide-react";
import type { SavedCalculationRow } from "@/types/database";
import { Button } from "@/components/ui/button";
import { DeleteCalculationButton } from "@/components/dashboard/delete-calculation-button";

/** Footer of a saved-calculation card: Edit opens it in the calculator; Delete asks to confirm. */
export function CalculationActions({ calculation }: { calculation: SavedCalculationRow }) {
  return (
    <DeleteCalculationButton
      id={calculation.id}
      leading={
        <Link href={`/calculator?edit=${calculation.id}`}>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="gap-1.5 text-ink-500 hover:text-ink-900"
          >
            <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
            Edit
          </Button>
        </Link>
      }
    />
  );
}