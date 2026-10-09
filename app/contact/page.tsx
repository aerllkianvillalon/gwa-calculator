import type { Metadata } from "next";
import { MessageCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact",
  description: "Questions, feedback or bug reports about the GWA Calculator.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:py-14">
      <h1 className="font-serif text-3xl font-medium text-ink-900">Contact</h1>
      <p className="mt-3 text-ink-700">
        Have a question, found a bug, or want to suggest a grading scale or feature? Send us a
        message.
      </p>

      <a
        href="https://www.facebook.com/profile.php?id=61594447531796"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 flex items-center gap-4 rounded-lg border border-ink-100 bg-paper-raised p-5 transition-shadow hover:shadow-md"
      >
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ledger-100 text-ledger-900"
          aria-hidden="true"
        >
          <MessageCircle className="h-5 w-5" />
        </span>
        <span>
          <span className="block font-serif text-base font-medium text-ink-900">
            Message us on Facebook
          </span>
          <span className="block text-sm text-ink-500">Opens in a new tab</span>
        </span>
      </a>

      <p className="mt-6 text-sm text-ink-500">
        Please don&apos;t send passwords or other private details in a message. For how we handle
        your data, see the privacy notice.
      </p>
    </main>
  );
}
