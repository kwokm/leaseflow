"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DeskPill, DeskToolbar } from "@/components/desk/packet-window";
import { StatusPill } from "@/components/desk/status-pill";
import { ListingThumb } from "@/components/listings/photos";
import { listingThumb } from "@/lib/listings/store";
import { useProperties } from "@/lib/listings/use-property";
import { useDeskApplicants } from "@/lib/desk/use-desk-applicants";
import { listingRollup } from "@/lib/desk/queue";
import { shortAddress } from "@/lib/desk/display";
import { Reveal } from "@/components/motion/reveal";

export default function ListingsPage() {
  const router = useRouter();
  const { properties, ready } = useProperties();
  const { applicants } = useDeskApplicants();
  const empty = ready && properties.length === 0;

  return (
    <Reveal>
      <DeskToolbar meta={`${properties.length} listings`}>
        <DeskPill active>All properties</DeskPill>
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard/listings/new?mode=import">Import listing</Link>
        </Button>
        <Button asChild size="sm">
          <Link href="/dashboard/listings/new">New listing</Link>
        </Button>
      </DeskToolbar>

      {empty ? (
        <section className="px-5 py-12 sm:px-6">
          <p className="text-[12px] font-medium uppercase tracking-[0.06em] text-mute-2">
            Properties
          </p>
          <h1 className="mt-2 text-[24px] font-semibold tracking-[-0.5px] text-ink">
            No listings yet.
          </h1>
          <p className="mt-2 max-w-xl text-[14px] font-medium leading-5 text-mute">
            Import a public Zillow or Redfin URL, or add a property by hand. The
            pipeline stays empty until you do.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/dashboard/listings/new?mode=import">Import listing</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard/listings/new">Add manually</Link>
            </Button>
          </div>
        </section>
      ) : (
      <div className="overflow-x-auto">
        <table className="app-table">
          <thead>
            <tr>
              <th>Listing</th>
              <th className="num">Rent</th>
              <th className="num">Applicants</th>
              <th className="num">LeaseScore</th>
              <th>Application status</th>
              <th>Package</th>
            </tr>
          </thead>
          <tbody>
            {properties.map((property) => {
              const rollup = listingRollup(
                applicants.filter((row) => row.propertyId === property.id)
              );
              const thumb = listingThumb(property);

              return (
                <tr
                  key={property.id}
                  className="cursor-pointer"
                  tabIndex={0}
                  onClick={() => router.push(`/dashboard/listings/${property.id}`)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      router.push(`/dashboard/listings/${property.id}`);
                    }
                  }}
                  aria-label={`Open applicants for ${shortAddress(property.address)}`}
                >
                  <td>
                    <div className="flex items-center gap-3">
                      <ListingThumb src={thumb} alt={shortAddress(property.address)} />
                      <div>
                        <div className="font-medium text-ink">{shortAddress(property.address)}</div>
                        <div className="text-[12px] text-mute">
                          {property.bedrooms} bed · {property.bathrooms} bath
                          {property.sqft ? ` · ${property.sqft.toLocaleString()} sqft` : ""}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="num">${property.rent.toLocaleString()}</td>
                  <td className="num">{rollup.count}</td>
                  <td className="num score">{rollup.leadScore ?? "—"}</td>
                  <td>
                    {rollup.leadStatus ? (
                      <StatusPill status={rollup.leadStatus} />
                    ) : (
                      <span className="status">Empty</span>
                    )}
                  </td>
                  <td>Standard</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      )}
    </Reveal>
  );
}
