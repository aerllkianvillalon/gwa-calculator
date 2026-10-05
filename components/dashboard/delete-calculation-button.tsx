"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { useConfirmedDelete } from "@/lib/hooks/use-confirmed-delete";

export function DeleteCalculationButton({ id }: { id: string }) {
  const router = useRouter();
  const { status, isDeleting, askToConfirm, cancel, confirmDelete } = useConfirmedDelete(
    `/api/calculations/${id}`,
    () => router.refresh()
  );

  if (status === "confirming") {
    return (
      <div className="flex flex-col gap-2">
        <Alert tone="warning">Delete this calculation? This can't be undone.</Alert>
        <div className="flex gap-2">
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
    <div className="flex flex-col gap-2">
      <Button variant="ghost" size="sm" onClick={askToConfirm}>
        Delete
      </Button>
      {status === "error" && (
        <Alert tone="error">Couldn't delete that. Please try again.</Alert>
      )}
    </div>
  );
}
