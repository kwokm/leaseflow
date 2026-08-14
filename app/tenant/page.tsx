"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DeskToolbar } from "@/components/desk/packet-window";
import { ListingGallery } from "@/components/listings/photos";
import { Reveal } from "@/components/motion/reveal";
import { FEATURED_LISTING_ID } from "@/lib/data/mock-data";
import { shortAddress } from "@/lib/desk/display";
import { loadTenantPacket, tenantStatusLabel, type TenantPacket } from "@/lib/tenant/session";

export default function TenantDeskPage() {
  const [packet, setPacket] = useState<TenantPacket | null>(null);

  useEffect(() => {
    setPacket(loadTenantPacket(FEATURED_LISTING_ID));
  }, []);

  if (!packet) return null;

  const { property, applicant, draft, submitted, status, step, stepName } = packet;
  const income = Number(draft.income.monthlyIncome) || 0;
  const multiple = property.rent ? income / property.rent : 0;

  return (
    <Reveal>
      <DeskToolbar meta="Signed in as Jane Doe">
        <span className="desk-pill is-on">
          {tenantStatusLabel(status, submitted)}
        </span>
        <Button asChild size="sm">
          <Link href={`/apply/${property.id}`}>{submitted ? "Review apply" : "Continue apply"}</Link>
        </Button>
      </DeskToolbar>

      <div className="space-y-6 px-5 py-5 sm:px-6">
        <div>
          <p className="text-[18px] font-semibold tracking-[-0.3px] text-ink">
            {shortAddress(property.address)}
          </p>
          <p className="mt-1 text-[13px] font-medium text-mute">
            {property.neighborhood ?? "The Colony / central Anaheim"} · {property.bedrooms} bed ·{" "}
            {property.bathrooms} bath
            {property.sqft ? ` · ${property.sqft.toLocaleString()} sqft` : ""} · $
            {property.rent.toLocaleString()}/mo
          </p>
        </div>

        <ListingGallery photos={property.photos} alt={shortAddress(property.address)} />

        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
          <div>
            <dt className="text-[12px] font-medium text-mute-2">Status</dt>
            <dd className="mt-0.5 text-[13px] font-medium text-ink">
              {tenantStatusLabel(status, submitted)}
            </dd>
          </div>
          <div>
            <dt className="text-[12px] font-medium text-mute-2">Progress</dt>
            <dd className="mt-0.5 text-[13px] font-medium text-ink">
              {submitted ? "Packet submitted" : `Step ${step} · ${stepName}`}
            </dd>
          </div>
          <div>
            <dt className="text-[12px] font-medium text-mute-2">Package</dt>
            <dd className="mt-0.5 text-[13px] font-medium capitalize text-ink">
              {property.screeningPackage}
            </dd>
          </div>
          <div>
            <dt className="text-[12px] font-medium text-mute-2">Applicant</dt>
            <dd className="mt-0.5 text-[13px] font-medium text-ink">
              {applicant.firstName} {applicant.lastName}
            </dd>
          </div>
        </dl>

        {submitted ? (
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 rounded-md border border-line bg-mist/40 p-4 sm:grid-cols-3">
            <div>
              <dt className="text-[12px] font-medium text-mute-2">LeaseScore</dt>
              <dd className="mt-0.5 text-[18px] font-semibold tracking-[-0.3px] text-ink">
                {draft.experian.score ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="text-[12px] font-medium text-mute-2">Credit</dt>
              <dd className="mt-0.5 text-[13px] font-medium text-ink">
                {draft.experian.status === "connected"
                  ? `${draft.experian.scoreModel ?? "Demo score"} · ${draft.experian.score ?? "—"}`
                  : "Not connected"}
              </dd>
            </div>
            <div>
              <dt className="text-[12px] font-medium text-mute-2">Income</dt>
              <dd className="mt-0.5 text-[13px] font-medium text-ink">
                ${income.toLocaleString()}/mo
                {multiple ? ` · ${multiple.toFixed(1)}× rent` : ""}
              </dd>
            </div>
          </dl>
        ) : (
          <p className="text-[14px] font-medium text-mute">
            Finish the application to land LeaseScore, credit, and income on this desk. Progress saves
            in this browser.
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href={`/apply/${property.id}`}>{submitted ? "Open apply packet" : "Continue apply"}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/tenant/applications/${property.id}`}>Application detail</Link>
          </Button>
        </div>
      </div>
    </Reveal>
  );
}
