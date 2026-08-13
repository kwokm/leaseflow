"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ApplicationDesk } from "@/components/desk/application-desk";
import { DeskToolbar } from "@/components/desk/packet-window";
import { Button } from "@/components/ui/button";
import { getPropertyById } from "@/lib/data/mock-data";
import { loadDeskApplicantsForListing, listingRollup } from "@/lib/desk/queue";
import { shortAddress } from "@/lib/desk/display";
import { Reveal } from "@/components/motion/reveal";
import type { Applicant } from "@/lib/data/mock-data";

export default function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const property = getPropertyById(id);
  const [applicants, setApplicants] = useState<Applicant[]>([]);

  useEffect(() => {
    setApplicants(loadDeskApplicantsForListing(id));
  }, [id]);

  if (!property) notFound();

  const rollup = listingRollup(applicants);

  return (
    <>
      <Reveal>
        <DeskToolbar meta={`${rollup.count} applicant${rollup.count === 1 ? "" : "s"}`}>
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/listings">All listings</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href={`/apply/${property.id}`}>Apply link</Link>
          </Button>
          <span className="desk-pill capitalize">{property.screeningPackage}</span>
        </DeskToolbar>
      </Reveal>

      <Reveal className="border-b border-line px-5 py-5 sm:px-6">
        <p className="text-[18px] font-semibold tracking-[-0.3px] text-ink">
          {shortAddress(property.address)}
        </p>
        <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-5">
          {[
            ["Rent", `$${property.rent.toLocaleString()}/mo`],
            ["Beds / baths", `${property.bedrooms} / ${property.bathrooms}`],
            ["Package", property.screeningPackage],
            ["Applicants", String(rollup.count)],
            ["Avg LeaseScore", rollup.avgScore ? String(rollup.avgScore) : "—"],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-[12px] font-medium text-mute-2">{label}</dt>
              <dd className="mt-0.5 text-[13px] font-medium capitalize text-ink">{value}</dd>
            </div>
          ))}
        </dl>
      </Reveal>

      <ApplicationDesk propertyId={property.id} extras chrome={false} />
    </>
  );
}
