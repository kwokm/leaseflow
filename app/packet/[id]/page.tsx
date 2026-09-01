"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { BrandMark, BrandWord } from "@/components/brand";
import { PacketWindow } from "@/components/desk/packet-window";
import { AiDocCheck } from "@/components/docs/ai-check";
import { PageWash } from "@/components/page-wash";
import { Reveal } from "@/components/motion/reveal";
import { SpatialMount, SpatialOrigin } from "@/components/motion/spatial";
import { ApplicationToRent } from "@/components/rental-app/application-to-rent";
import { Button } from "@/components/ui/button";
import { checkApplicationDetails, checkApplyState } from "@/lib/docs/ai-check";
import { resolveRentalPacket } from "@/lib/apply/rental-app";
import { shortAddress } from "@/lib/desk/display";

export default function SharedPacketPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [packet, setPacket] = useState<ReturnType<typeof resolveRentalPacket>>(null);

  useEffect(() => {
    setPacket(resolveRentalPacket(id));
  }, [id]);

  if (!packet) {
    return (
      <div className="relative min-h-screen bg-white">
        <PageWash />
        <div className="relative z-10 mx-auto max-w-shell px-5 py-24 text-center">
          <p className="text-[15px] font-medium text-ink">Packet not found</p>
          <Button asChild className="mt-4">
            <Link href="/">Back to Leaseproof</Link>
          </Button>
        </div>
      </div>
    );
  }

  const { application, applicant, property, details, state } = packet;
  const fullName = `${applicant.firstName} ${applicant.lastName}`;
  const docCheck = state
    ? checkApplyState(state)
    : checkApplicationDetails(details, fullName);

  return (
    <div className="relative min-h-screen overflow-hidden bg-white print:bg-white">
      <SpatialOrigin>
        <PageWash className="print:hidden" />
      </SpatialOrigin>

      <header className="relative z-50 bg-white print:hidden">
        <div className="mx-auto flex h-16 max-w-header items-center gap-4 px-5 sm:px-8">
          <Link href="/" className="flex items-center gap-2.5 text-ink">
            <BrandMark />
            <BrandWord />
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <Button type="button" variant="outline" onClick={() => window.print()}>
              Print
            </Button>
            <Button asChild variant="outline">
              <Link href="/tenant">Tenant desk</Link>
            </Button>
            <Button asChild>
              <Link href={`/dashboard/applications/${applicant.id}`}>Realtor packet</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-shell px-5 pb-12 pt-2 sm:px-8">
        <SpatialMount>
          <PacketWindow
            title={`Application to Rent • ${fullName}`}
            meta={`${shortAddress(property.address)} · shareable`}
          >
            <Reveal>
              <div className="border-b border-line px-5 py-4 print:hidden sm:px-6">
                <p className="text-[13px] font-medium text-mute">
                  Prototype share link — no sign-in. Filled application, listing photos, and AI
                  income check.
                </p>
              </div>
              <ApplicationToRent application={application} />
              <div className="border-t border-line px-5 py-5 sm:px-6">
                <AiDocCheck report={docCheck} scan={false} embedded />
              </div>
            </Reveal>
          </PacketWindow>
        </SpatialMount>
      </div>
    </div>
  );
}
