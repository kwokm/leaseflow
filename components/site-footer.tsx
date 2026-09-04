import Link from "next/link";

/** Minimal public footer — Privacy, Terms, and copyright. Always visible. */
export function SiteFooter() {
  return (
    <footer id="legal" className="border-t border-line bg-white">
      <div className="mx-auto flex max-w-shell flex-col gap-3 px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p className="text-[13px] font-medium text-mute">
          © 2026 AAI Suzuki LLC / Leaseproof
        </p>
        <nav aria-label="Legal" className="flex flex-wrap gap-x-4 gap-y-1 text-[13px] font-medium">
          <Link href="/privacy" className="text-ink underline underline-offset-4">
            Privacy
          </Link>
          <Link href="/terms" className="text-ink underline underline-offset-4">
            Terms
          </Link>
        </nav>
      </div>
    </footer>
  );
}
