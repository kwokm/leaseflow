"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DeskToolbar } from "@/components/desk/packet-window";
import { ListingPhotoStrip } from "@/components/listings/photos";
import { Reveal } from "@/components/motion/reveal";
import { FEATURED_LISTING_ID } from "@/lib/data/mock-data";
import { shortAddress } from "@/lib/desk/display";
import { ApplicationToRent } from "@/components/rental-app/application-to-rent";
import { AiDocCheckCompact } from "@/components/docs/ai-check";
import { checkApplyState } from "@/lib/docs/ai-check";
import { rentalApplicationFromState } from "@/lib/apply/rental-app";
import { loadTenantPacket, tenantStatusLabel, type TenantPacket } from "@/lib/tenant/session";

export default function TenantApplicationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [packet, setPacket] = useState<TenantPacket | null>(null);

  useEffect(() => {
    const listingId = id === "app-jane" ? FEATURED_LISTING_ID : id;
    setPacket(loadTenantPacket(listingId));
  }, [id]);

  if (!packet) return null;

  const { property, applicant, draft, submitted, status, step, stepName } = packet;

  return (
    <Reveal>
      <DeskToolbar meta={tenantStatusLabel(status, submitted)}>
        <Button asChild variant="outline" size="sm">
          <Link href="/tenant">Back to desk</Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href={`/packet/${applicant.id}`}>Share</Link>
        </Button>
        <Button asChild size="sm">
          <Link href={`/apply/${property.id}`}>{submitted ? "Review apply" : "Continue apply"}</Link>
        </Button>
      </DeskToolbar>

      <div className="space-y-5 px-5 py-5 sm:px-6">
        <div>
          <p className="text-[18px] font-semibold tracking-[-0.3px] text-ink">
            {applicant.firstName} {applicant.lastName}
          </p>
          <p className="mt-1 text-[13px] font-medium text-mute">
            {shortAddress(property.address)} · {submitted ? "Submitted" : `In progress · ${stepName}`}
          </p>
        </div>

        <ListingPhotoStrip photos={property.photos} alt={shortAddress(property.address)} size="md" />

        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
          <div>
            <dt className="text-[12px] font-medium text-mute-2">Email</dt>
            <dd className="mt-0.5 text-[13px] font-medium text-ink">{applicant.email}</dd>
          </div>
          <div>
            <dt className="text-[12px] font-medium text-mute-2">Phone</dt>
            <dd className="mt-0.5 text-[13px] font-medium text-ink">{applicant.phone}</dd>
          </div>
          <div>
            <dt className="text-[12px] font-medium text-mute-2">Step</dt>
            <dd className="mt-0.5 text-[13px] font-medium text-ink">
              {submitted ? "Done" : `${step} · ${stepName}`}
            </dd>
          </div>
          {submitted ? (
            <>
              <div>
                <dt className="text-[12px] font-medium text-mute-2">LeaseScore</dt>
                <dd className="mt-0.5 text-[13px] font-semibold text-ink">
                  {draft.experian.score ?? "—"}
                </dd>
              </div>
              <div>
                <dt className="text-[12px] font-medium text-mute-2">Employer</dt>
                <dd className="mt-0.5 text-[13px] font-medium text-ink">{draft.income.employer}</dd>
              </div>
              <div>
                <dt className="text-[12px] font-medium text-mute-2">Stated income</dt>
                <dd className="mt-0.5 text-[13px] font-medium text-ink">
                  ${Number(draft.income.monthlyIncome || 0).toLocaleString()}/mo
                </dd>
              </div>
            </>
          ) : null}
        </dl>

        <AiDocCheckCompact report={checkApplyState(draft)} />

        <div className="overflow-hidden rounded-lg border border-line">
          <ApplicationToRent application={rentalApplicationFromState(draft, property)} />
        </div>
      </div>
    </Reveal>
  );
}
