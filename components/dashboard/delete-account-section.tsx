"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { useConfirmedDelete } from "@/lib/hooks/use-confirmed-delete";

export function DeleteAccountSection() {
  const router = useRouter();
  const { status, isDeleting, askToConfirm, cancel, confirmDelete } = useConfirmedDelete(
    "/api/account",
    () => {
      router.push("/");
      router.refresh();
    }
  );

  return (
    <div>
      <h2 className="font-serif text-lg font-medium text-danger-600">Delete account</h2>
      <p className="mt-1 text-sm text-ink-500">
        This permanently deletes your account and every saved GWA calculation. This can't be
        undone.
      </p>

      {status === "confirming" ? (
        <div className="mt-3 flex flex-col gap-2">
          <Alert tone="warning">Are you sure? This is permanent.</Alert>
          <div className="flex gap-2">
            <Button variant="danger" size="sm" onClick={confirmDelete} isLoading={isDeleting}>
              Yes, delete my account
            </Button>
            <Button variant="ghost" size="sm" onClick={cancel}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button variant="danger" size="sm" className="mt-3" onClick={askToConfirm}>
          Delete account
        </Button>
      )}

      {status === "error" && (
        <Alert tone="error" className="mt-3">
          Couldn't delete your account. Please try again.
        </Alert>
      )}
    </div>
  );
}
