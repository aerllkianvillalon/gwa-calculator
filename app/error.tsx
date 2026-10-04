"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log only the digest-bearing error object; the UI never shows internals.
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex max-w-md flex-col items-center px-4 py-20 text-center">
      <h1 className="font-serif text-2xl font-medium text-ink-900">Something went wrong</h1>
      <p className="mt-2 text-sm text-ink-500">
        An unexpected error occurred. Your calculation hasn&apos;t been lost if you haven&apos;t
        left the page. Please try again.
      </p>
      <Button type="button" className="mt-6" onClick={reset}>
        Try again
      </Button>
    </main>
  );
}
