"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DeskPill, DeskToolbar } from "@/components/desk/packet-window";
import { StatusPill } from "@/components/desk/status-pill";
import { mockProperties } from "@/lib/data/mock-data";
import { loadDeskApplicants, listingRollup } from "@/lib/desk/queue";
import { shortAddress } from "@/lib/desk/display";
import { Reveal } from "@/components/motion/reveal";
import type { Applicant } from "@/lib/data/mock-data";

export default function ListingsPage() {
  const router = useRouter();
  const [applicants, setApplicants] = useState<Applicant[]>([]);

  useEffect(() => {
    setApplicants(loadDeskApplicants());
  }, []);

  return (
    <Reveal>
      <DeskToolbar meta={`${mockProperties.length} listings`}>
        <DeskPill active>All properties</DeskPill>
        <Button asChild size="sm">
          <Link href="/dashboard/listings/new">New listing</Link>
        </Button>
      </DeskToolbar>

      <div className="overflow-x-auto">
        <table className="app-table">
          <thead>
            <tr>
              <th>Listing</th>
              <th className="num">Rent</th>
              <th className="num">Applicants</th>
              <th className="num">LeaseScore</th>
              <th>Lead status</th>
              <th>Package</th>
            </tr>
          </thead>
          <tbody>
            {mockProperties.map((property) => {
              const rollup = listingRollup(
                applicants.filter((row) => row.propertyId === property.id)
              );

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
                    <div className="font-medium text-ink">{shortAddress(property.address)}</div>
                    <div className="text-[12px] text-mute">
                      {property.bedrooms} bed · {property.bathrooms} bath
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
                  <td className="capitalize">{property.screeningPackage}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Reveal>
  );
}
