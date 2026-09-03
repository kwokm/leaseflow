import Link from "next/link";
import { BrandMark, BrandWord } from "@/components/brand";
import { RenterHelpActions } from "@/components/apply/renter-help";
import { SpatialMount, SpatialOrigin } from "@/components/motion/spatial";
import { PageWash } from "@/components/page-wash";
import { LANDLORD_SIGN_IN_HREF } from "@/lib/auth/roles";

export default function NotFound() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-white">
      <SpatialOrigin>
        <PageWash />
      </SpatialOrigin>

      <header className="relative z-50 bg-white">
        <div className="mx-auto flex h-16 max-w-header items-center gap-4 px-5 sm:px-8">
          <Link href="/" className="flex items-center gap-2.5 text-ink">
            <BrandMark />
            <BrandWord />
          </Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-shell px-5 py-24 sm:px-8">
        <SpatialMount>
          <section className="window px-8 py-12 text-center sm:px-12">
            <p className="text-[13px] font-medium tracking-[-0.13px] text-mute">404</p>
            <h1 className="mt-2 text-[28px] font-semibold tracking-[-0.7px] text-ink">
              This page is not in the packet.
            </h1>
            <p className="mx-auto mt-2 max-w-md text-[15px] font-medium leading-6 text-mute">
              The link may be old, or the file lives on another desk. Ask your landlord to resend
              the link.
            </p>
            <RenterHelpActions />
            <p className="mt-4 text-[12px] font-medium text-mute">
              Landlords —{" "}
              <Link href={LANDLORD_SIGN_IN_HREF} className="text-ink underline underline-offset-4">
                Sign in
              </Link>
            </p>
          </section>
        </SpatialMount>
      </div>
    </div>
  );
}
