import Link from "next/link";
import { BrandMark, BrandWord } from "@/components/brand";
import { PacketWindow } from "@/components/desk/packet-window";
import { SpatialMount, SpatialOrigin } from "@/components/motion/spatial";
import { PageWash } from "@/components/page-wash";

/** Shared lilac-wash chrome for the Clerk sign-in and sign-up widgets. */
export function AuthShell({
  meta,
  children,
}: {
  meta: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-white">
      <SpatialOrigin>
        <PageWash />
      </SpatialOrigin>

      <header className="relative z-50 bg-white">
        <div className="mx-auto flex h-16 max-w-header items-center gap-4 px-5 sm:px-8">
          <Link href="/" className="flex items-center gap-2.5 text-ink" aria-label="Leaseproof home">
            <BrandMark />
            <BrandWord />
          </Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-[520px] px-5 py-10 sm:px-8 sm:py-16">
        <SpatialMount>
          <PacketWindow title="Leaseproof" meta={meta}>
            <div className="px-6 py-7 sm:px-8">{children}</div>
          </PacketWindow>
        </SpatialMount>
      </div>
    </div>
  );
}

/**
 * Shown when Clerk keys are absent. The desk is unreachable in that state
 * (middleware fails closed), so this explains why rather than 404ing.
 */
export function AuthUnconfigured({ demo }: { demo: boolean }) {
  return (
    <div>
      <h1 className="text-[24px] font-semibold leading-[1.15] tracking-[-0.4px] text-ink">
        {demo ? "Demo mode — no sign-in needed" : "Sign-in is not configured"}
      </h1>
      <p className="mt-2 text-[14px] font-medium leading-5 text-mute">
        {demo
          ? "This deployment runs with LEASEPROOF_DEMO=1, so the desk is open and seeded with sample listings."
          : "Set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY to enable landlord and renter accounts. Until then the desk stays closed."}
      </p>
      {demo ? (
        <p className="mt-5">
          <Link
            href="/dashboard"
            className="text-[14px] font-medium text-ink underline underline-offset-4"
          >
            Open the desk
          </Link>
        </p>
      ) : null}
    </div>
  );
}
