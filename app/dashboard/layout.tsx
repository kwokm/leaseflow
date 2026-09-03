import Link from "next/link";
import { redirect } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { BrandMark, BrandWord } from "@/components/brand";
import { DeskFrame } from "@/components/desk/desk-frame";
import { DashboardMotion } from "@/components/motion/dashboard-motion";
import { SpatialMount, SpatialOrigin } from "@/components/motion/spatial";
import { PageWash } from "@/components/page-wash";
import { Button } from "@/components/ui/button";
import { PrivateBetaGate } from "@/components/auth/private-beta-gate";
import { getDeskLandlord } from "@/lib/auth/current-user";
import { clerkEnabled, isDemoMode } from "@/lib/config/env";
import { FEATURED_LISTING_ID } from "@/lib/data/mock-data";

/**
 * The desk is per-request by definition. Without this, a build that happens to
 * run without Clerk keys prerenders the layout — baking the signed-out redirect
 * into a static page that a signed-in landlord would then be served.
 */
export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const demo = isDemoMode();
  const desk = await getDeskLandlord();

  // Middleware is the primary gate; this is the second one, so a misconfigured
  // matcher cannot expose landlord data.
  if (desk.status === "signed-out") redirect("/signin?next=/dashboard");
  if (desk.status === "not-invited") {
    return <PrivateBetaGate email={desk.email} />;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-white print:bg-white">
      <SpatialOrigin>
        <PageWash />
      </SpatialOrigin>

      <header className="relative z-50 bg-white print:hidden">
        <div className="mx-auto flex h-16 max-w-header items-center gap-4 px-5 sm:px-8">
          <Link href="/" className="flex items-center gap-2.5 text-ink">
            <BrandMark />
            <BrandWord />
          </Link>
          <span className="desk-pill">{demo ? "Demo" : "Private beta"}</span>
          <div className="ml-auto flex items-center gap-2">
            {/* The seeded listing only exists under LEASEPROOF_DEMO, so outside
                demo mode this button is a guaranteed 404. Real apply links come
                off each listing. */}
            {demo ? (
              <Button asChild variant="outline">
                <Link href={`/apply/${FEATURED_LISTING_ID}`}>Apply as renter</Link>
              </Button>
            ) : null}
            <Button asChild variant="outline">
              <Link href="/dashboard/listings/new?mode=import">Import listing</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard/listings/new">New listing</Link>
            </Button>
            {clerkEnabled() ? (
              <UserButton afterSignOutUrl="/" />
            ) : (
              <Button asChild>
                <Link href="/dashboard">Open desk</Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-shell px-5 pb-12 pt-2 sm:px-8">
        <SpatialMount>
          <DeskFrame>
            <DashboardMotion>{children}</DashboardMotion>
          </DeskFrame>
        </SpatialMount>
      </div>
    </div>
  );
}
