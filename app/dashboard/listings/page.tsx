"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DeskPill, DeskToolbar } from "@/components/desk/packet-window";
import { StatusPill } from "@/components/desk/status-pill";
import {
  getApplicantsByProperty,
  mockProperties,
  type ApplicationStatus,
} from "@/lib/data/mock-data";
import { shortAddress } from "@/lib/desk/display";

function leadStatus(statuses: ApplicationStatus[]): ApplicationStatus {
  if (statuses.includes("approved")) return "approved";
  if (statuses.includes("completed")) return "completed";
  if (statuses.includes("declined")) return "declined";
  if (statuses.includes("in_progress")) return "in_progress";
  return "invited";
}

export default function ListingsPage() {
  const router = useRouter();

  return (
    <>
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
              <th>Lead status</th>
              <th>Package</th>
            </tr>
          </thead>
          <tbody>
            {mockProperties.map((property) => {
              const applicants = getApplicantsByProperty(property.id);
              const status = leadStatus(applicants.map((row) => row.status));

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
                  <td className="num">{applicants.length}</td>
                  <td>
                    {applicants.length ? <StatusPill status={status} /> : <span className="status">Empty</span>}
                  </td>
                  <td className="capitalize">{property.screeningPackage}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
