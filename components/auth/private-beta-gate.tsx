"use client";

import { SignOutButton } from "@clerk/nextjs";
import { PRIVATE_BETA_MESSAGE } from "@/lib/auth/beta-allowlist";
import { PacketWindow } from "@/components/desk/packet-window";
import { SpatialMount, SpatialOrigin } from "@/components/motion/spatial";
import { PageWash } from "@/components/page-wash";
import { BrandMark, BrandWord } from "@/components/brand";
import { Button } from "@/components/ui/button";

export function PrivateBetaGate({ email }: { email: string }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-white">
      <SpatialOrigin>
        <PageWash />
      </SpatialOrigin>

      <header className="relative z-50 bg-white">
        <div className="mx-auto flex h-16 max-w-header items-center gap-4 px-5 sm:px-8">
          <span className="flex items-center gap-2.5 text-ink">
            <BrandMark />
            <BrandWord />
          </span>
          <span className="desk-pill">Private beta</span>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-[520px] px-5 py-10 sm:px-8 sm:py-16">
        <SpatialMount>
          <PacketWindow title="Leaseproof" meta="Private beta">
            <div className="px-6 py-7 sm:px-8">
              <h1 className="text-[24px] font-semibold leading-[1.15] tracking-[-0.4px] text-ink">
                This desk is invite-only
              </h1>
              <p className="mt-3 text-[14px] font-medium leading-5 text-mute">
                {PRIVATE_BETA_MESSAGE}
              </p>
              {email ? (
                <p className="mt-3 text-[14px] font-medium leading-5 text-ink-2">
                  Signed in as {email}. That address is not on the landlord
                  allowlist.
                </p>
              ) : null}
              <p className="mt-3 text-[14px] font-medium leading-5 text-mute">
                If you are applying for a home, use the apply link your landlord
                sent — you do not need to be on this list.
              </p>
              <div className="mt-6">
                <SignOutButton redirectUrl="/signup">
                  <Button type="button" variant="outline">
                    Sign out
                  </Button>
                </SignOutButton>
              </div>
            </div>
          </PacketWindow>
        </SpatialMount>
      </div>
    </div>
  );
}
