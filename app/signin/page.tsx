import { Suspense } from "react";
import Link from "next/link";
import { BrandMark, BrandWord } from "@/components/brand";
import { LandlordAuth } from "@/components/auth/landlord-auth";
import { SpatialMount, SpatialOrigin } from "@/components/motion/spatial";
import { PageWash } from "@/components/page-wash";

export const metadata = {
  title: "Sign in — Leaseproof",
  description: "Sign in or create a landlord desk. Prototype only.",
};

export default function SignInPage() {
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
          <Suspense
            fallback={
              <p className="text-center text-[14px] font-medium text-mute">Opening sign in…</p>
            }
          >
            <LandlordAuth />
          </Suspense>
        </SpatialMount>
      </div>
    </div>
  );
}
