import Link from "next/link";
import { PacketWindow } from "@/components/desk/packet-window";
import { SpatialMount, SpatialOrigin } from "@/components/motion/spatial";
import { PageWash } from "@/components/page-wash";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { deskSignUpHref } from "@/lib/auth/roles";

/** Shared lilac-wash chrome for the Clerk sign-in and sign-up widgets. */
export function AuthShell({
  meta,
  children,
}: {
  meta: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-white">
      <SpatialOrigin>
        <PageWash />
      </SpatialOrigin>

      <SiteHeader />

      <div className="relative z-10 mx-auto w-full max-w-[520px] flex-1 px-5 py-10 sm:px-8 sm:py-16">
        <SpatialMount>
          <PacketWindow title="Leaseproof" meta={meta}>
            <div className="auth-widget px-6 py-7 sm:px-8">{children}</div>
          </PacketWindow>
        </SpatialMount>
      </div>

      <div className="relative z-10">
        <SiteFooter />
      </div>
    </div>
  );
}

/**
 * Shown when Clerk keys are absent. The desk is unreachable in that state
 * (middleware fails closed), so this explains why rather than 404ing.
 */
export function AuthUnconfigured({
  demo,
  next,
  surface = "signin",
}: {
  demo: boolean;
  next?: string;
  surface?: "signin" | "signup";
}) {
  return (
    <div>
      <h1 className="text-[24px] font-semibold leading-[1.15] tracking-[-0.4px] text-ink">
        {demo ? "Demo mode — no sign-in needed" : "Landlord desk"}
      </h1>
      <p className="mt-2 text-[14px] font-medium leading-5 text-mute">
        {demo
          ? "This deployment runs with LEASEPROOF_DEMO=1, so the desk is open and seeded with sample listings."
          : surface === "signup"
            ? "Orange County private beta. Invited landlords create a desk here. Sign-up is not configured on this deployment yet."
            : "Orange County private beta. Invited landlords without an account should create a desk first. Sign-in is not configured on this deployment yet."}
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
      ) : surface === "signin" ? (
        <p className="mt-5">
          <Link
            href={deskSignUpHref(next)}
            className="text-[14px] font-medium text-ink underline underline-offset-4"
          >
            Invited? Create your desk
          </Link>
        </p>
      ) : null}
    </div>
  );
}
