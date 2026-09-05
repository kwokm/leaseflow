import { RenterHelpActions } from "@/components/apply/renter-help";
import { SpatialMount, SpatialOrigin } from "@/components/motion/spatial";
import { PageWash } from "@/components/page-wash";
import { SiteHeader } from "@/components/site-header";

/**
 * Dedicated empty-apply page for the marketing CTA when there is no public
 * listing to apply to. Not a 404 — the visitor is not missing a packet, they
 * need a link from their landlord.
 */
export function NeedApplyLink() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-white">
      <SpatialOrigin>
        <PageWash />
      </SpatialOrigin>

      <SiteHeader />

      <div className="relative z-10 mx-auto max-w-shell px-5 py-24 sm:px-8">
        <SpatialMount>
          <section className="window px-8 py-12 text-center sm:px-12">
            <p className="text-[13px] font-medium tracking-[-0.13px] text-mute">Apply</p>
            <h1 className="mt-2 text-[28px] font-semibold tracking-[-0.7px] text-ink">
              Get a link from your landlord
            </h1>
            <p className="mx-auto mt-2 max-w-md text-[15px] font-medium leading-6 text-mute">
              Leaseproof applications open from a listing your landlord shares. There is no public
              apply queue — ask them to send the link for the home you want.
            </p>
            <RenterHelpActions />
          </section>
        </SpatialMount>
      </div>
    </div>
  );
}
