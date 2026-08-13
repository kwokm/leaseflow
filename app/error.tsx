"use client";

import Link from "next/link";
import { BrandMark, BrandWord } from "@/components/brand";
import { SpatialMount, SpatialOrigin } from "@/components/motion/spatial";
import { PageWash } from "@/components/page-wash";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-white">
      <SpatialOrigin>
        <PageWash />
      </SpatialOrigin>

      <header className="relative z-50 bg-white">
        <div className="mx-auto flex h-16 max-w-header items-center gap-4 px-5 sm:px-8">
          <Link href="/" className="group flex items-center gap-2.5 text-ink">
            <BrandMark className="transition-transform duration-200 ease-out group-hover:scale-110" />
            <BrandWord />
          </Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-shell px-5 py-24 sm:px-8">
        <SpatialMount>
          <section className="window px-8 py-12 text-center sm:px-12">
            <p className="text-[13px] font-medium tracking-[-0.13px] text-mute">Something broke</p>
            <h1 className="mt-2 text-[28px] font-semibold tracking-[-0.7px] text-ink">
              The desk hit a snag.
            </h1>
            <p className="mx-auto mt-2 max-w-md text-[15px] font-medium leading-6 text-mute">
              This is a prototype. Try again, or go back to the landing page.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <Button type="button" onClick={() => reset()}>
                Try again
              </Button>
              <Button asChild variant="outline">
                <Link href="/">Back to LeaseFlow</Link>
              </Button>
            </div>
          </section>
        </SpatialMount>
      </div>
    </div>
  );
}
