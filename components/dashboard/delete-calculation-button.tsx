"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { useConfirmedDelete } from "@/lib/hooks/use-confirmed-delete";

/**
 * `leading` (e.g. an Edit link) sits beside Delete, and is hidden while the delete
 * confirmation is showing so the confirmation gets the whole row.
 */
export function DeleteCalculationButton({ id, leading }: { id: string; leading?: ReactNode }) {
  const router = useRouter();
  const { status, isDeleting, askToConfirm, cancel, confirmDelete } = useConfirmedDelete(
    `/api/calculations/${id}`,
    () => router.refresh()
  );

  if (status === "confirming") {
    return (
      <div className="flex w-full flex-col gap-2">
        <Alert tone="warning">Delete this calculation? This can't be undone.</Alert>
        <div className="flex justify-end gap-2">
          <Button variant="danger" size="sm" onClick={confirmDelete} isLoading={isDeleting}>
            Yes, delete
          </Button>
          <Button variant="ghost" size="sm" onClick={cancel}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex items-center justify-end gap-1">
        {leading}
        <Button
          variant="ghost"
          size="sm"
          onClick={askToConfirm}
          className="gap-1.5 text-ink-500 hover:bg-danger-100 hover:text-danger-600"
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          Delete
        </Button>
      </div>
      {status === "error" && (
        <Alert tone="error">Couldn't delete that. Please try again.</Alert>
      )}
    </div>
  );
}