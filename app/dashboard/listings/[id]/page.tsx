"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ApplicationDesk } from "@/components/desk/application-desk";
import { DeskToolbar } from "@/components/desk/packet-window";
import { ListingGallery } from "@/components/listings/photos";
import { PhotoEnhanceDemo } from "@/components/demos/photo-enhance";
import { SyndicationDemo } from "@/components/demos/syndication";
import { SyndicationTiles } from "@/components/leasing/syndication";
import { Button } from "@/components/ui/button";
import { getPropertyById, type Applicant } from "@/lib/data/mock-data";
import { loadDeskApplicantsForListing, listingRollup } from "@/lib/desk/queue";
import { shortAddress } from "@/lib/desk/display";
import { listingPricing, pricingLabel } from "@/lib/leasing/ops";
import { setEnhanced, useEnhanced } from "@/lib/leasing/store";
import { Reveal } from "@/components/motion/reveal";

export default function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [property, setProperty] = useState(() => getPropertyById(id));
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [ready, setReady] = useState(false);

  const enhanced = useEnhanced(id);
  const pricing = listingPricing(id);

  useEffect(() => {
    setProperty(getPropertyById(id));
    setApplicants(loadDeskApplicantsForListing(id));
    setReady(true);
  }, [id]);

  if (ready && !property) notFound();
  if (!property) return null;

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
          <span className="desk-pill">{pricingLabel(pricing)} · demo</span>
        </DeskToolbar>
      </Reveal>

      <Reveal className="border-b border-line px-5 py-5 sm:px-6">
        <p className="text-[18px] font-semibold tracking-[-0.3px] text-ink">
          {shortAddress(property.address)}
        </p>
        <p className="mt-1 text-[13px] font-medium text-mute">
          {property.neighborhood ?? property.propertyType ?? property.address}
        </p>
        <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-5">
          {[
            ["Rent", `$${property.rent.toLocaleString()}/mo`],
            ["Beds / baths", `${property.bedrooms} / ${property.bathrooms}`],
            ["Sqft", property.sqft ? property.sqft.toLocaleString() : "—"],
            ["Applicants", String(rollup.count)],
            ["Avg LeaseScore", rollup.avgScore ? String(rollup.avgScore) : "—"],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-[12px] font-medium text-mute-2">{label}</dt>
              <dd className="mt-0.5 text-[13px] font-medium capitalize text-ink">{value}</dd>
            </div>
          ))}
        </dl>
        {property.photos?.length ? (
          <div className="mt-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-[13px] font-medium text-mute">
                AI photo enhance · CSS grade, not a live model
              </p>
              <button
                type="button"
                className={`desk-pill ${enhanced ? "is-on" : ""}`}
                aria-pressed={enhanced}
                onClick={() => setEnhanced(property.id, !enhanced)}
              >
                {enhanced ? "Enhanced on" : "Show enhance"}
              </button>
            </div>
            <PhotoEnhanceDemo />
            <div className="mt-3">
              <ListingGallery
                photos={property.photos}
                alt={shortAddress(property.address)}
                enhanced={enhanced}
              />
            </div>
          </div>
        ) : null}
        <div className="mt-5 overflow-hidden rounded-md border border-line">
          <SyndicationDemo />
        </div>
        <div className="mt-5">
          <SyndicationTiles listingId={property.id} />
        </div>
      </Reveal>

      <ApplicationDesk propertyId={property.id} extras chrome={false} />
    </>
  );
}
