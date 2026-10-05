"use client";

import { useState } from "react";

type DeleteStatus = "idle" | "confirming" | "error";

/**
 * State machine shared by the "delete calculation" and "delete account"
 * controls: idle -> confirming -> (request) -> success callback, or error.
 */
export function useConfirmedDelete(url: string, onDeleted: () => void) {
  const [status, setStatus] = useState<DeleteStatus>("idle");
  const [isDeleting, setIsDeleting] = useState(false);

  async function confirmDelete() {
    setIsDeleting(true);
    try {
      const response = await fetch(url, { method: "DELETE" });
      if (!response.ok) throw new Error();
      onDeleted();
    } catch {
      setIsDeleting(false);
      setStatus("error");
    }
  }

  return {
    status,
    isDeleting,
    askToConfirm: () => setStatus("confirming"),
    cancel: () => setStatus("idle"),
    confirmDelete,
  };
}
