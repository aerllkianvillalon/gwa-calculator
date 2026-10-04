import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex max-w-md flex-col items-center px-4 py-20 text-center">
      <p className="font-serif text-5xl font-medium tabular text-ledger-900">404</p>
      <h1 className="mt-3 font-serif text-2xl font-medium text-ink-900">Page not found</h1>
      <p className="mt-2 text-sm text-ink-500">
        The page you&apos;re looking for doesn&apos;t exist or has moved.
      </p>
      <Link href="/" className="mt-6">
        <Button type="button" variant="primary">
          Back to the calculator
        </Button>
      </Link>
    </main>
  );
}
