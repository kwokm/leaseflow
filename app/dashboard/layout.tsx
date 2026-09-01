import Link from "next/link";
import { RequireLandlord } from "@/components/auth/require-landlord";
import { BrandMark, BrandWord } from "@/components/brand";
import { DeskFrame } from "@/components/desk/desk-frame";
import { DashboardMotion } from "@/components/motion/dashboard-motion";
import { SpatialMount, SpatialOrigin } from "@/components/motion/spatial";
import { PageWash } from "@/components/page-wash";
import { Button } from "@/components/ui/button";
import { FEATURED_LISTING_ID } from "@/lib/data/mock-data";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireLandlord>
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
            <div className="ml-auto flex items-center gap-2">
              <Button asChild variant="outline">
                <Link href={`/apply/${FEATURED_LISTING_ID}`}>Apply as renter</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/dashboard/listings/new">New listing</Link>
              </Button>
              <Button asChild>
                <Link href="/dashboard">Open realtor desk</Link>
              </Button>
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
    </RequireLandlord>
  );
}
