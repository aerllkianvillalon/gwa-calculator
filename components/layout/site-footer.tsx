import Link from "next/link";

export function SiteFooter() {
  return (
    <footer data-site-footer className="mt-12 border-t border-ink-100">
      <div className="mx-auto max-w-3xl px-4 py-6 text-sm text-ink-500">
        <p>
          This tool estimates your General Weighted Average from the numbers you enter. It is not
          affiliated with any university and does not replace your registrar&apos;s official
          computation.
        </p>
        <p className="mt-2">
          <Link href="/privacy" className="underline">
            Privacy notice
          </Link>{" "}
          ·{" "}
          <a
            href="https://www.facebook.com/profile.php?id=61594447531796"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Questions? Contact us on Facebook
          </a>
        </p>
      </div>
    </footer>
  );
}
