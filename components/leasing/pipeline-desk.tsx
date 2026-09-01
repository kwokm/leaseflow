"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { DeskToolbar } from "@/components/desk/packet-window";
import { StatusPill } from "@/components/desk/status-pill";
import { Avatar } from "@/components/desk/avatar";
import { Reveal } from "@/components/motion/reveal";
import {
  FEATURED_LISTING_ID,
  getAllApplications,
  getAllProperties,
  type Applicant,
  type Property,
} from "@/lib/data/mock-data";
import { loadDeskApplicants } from "@/lib/desk/queue";
import { shortAddress } from "@/lib/desk/display";
import { SCREENING_TASKS, screeningChecks } from "@/lib/desk/screening";
import { listingThumb } from "@/lib/listings/store";
import { cn } from "@/lib/utils";

function sortHomes(properties: Property[]): Property[] {
  return [...properties].sort((a, b) => {
    if (a.id === FEATURED_LISTING_ID) return -1;
    if (b.id === FEATURED_LISTING_ID) return 1;
    return a.address.localeCompare(b.address);
  });
}

function HomePhoto({ property }: { property: Property }) {
  const src = listingThumb(property);
  const label = shortAddress(property.address);

  if (!src) {
    return (
      <div className="pipe-photo is-empty" aria-hidden>
        <span>{label}</span>
      </div>
    );
  }

  const remote = /^https?:\/\//i.test(src) && !/zillowstatic\.com/i.test(src);

  return (
    <div className="pipe-photo">
      {remote ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="h-full w-full object-cover" />
      ) : (
        <Image src={src} alt="" fill sizes="(min-width: 1024px) 360px, 100vw" className="object-cover" />
      )}
    </div>
  );
}

function ApplicantRow({ applicant }: { applicant: Applicant }) {
  const name = `${applicant.firstName} ${applicant.lastName}`;
  const checks = screeningChecks(applicant);

  return (
    <li>
      <Link
        href={`/dashboard/applications/${applicant.id}`}
        className="pipe-applicant"
        aria-label={`Open packet for ${name}`}
      >
        <span className="flex min-w-0 items-center gap-2">
          <Avatar firstName={applicant.firstName} lastName={applicant.lastName} />
          <span className="min-w-0">
            <span className="block truncate text-[13px] font-semibold tracking-[-0.16px] text-ink">
              {name}
            </span>
            <StatusPill status={applicant.status} className="mt-1" />
          </span>
        </span>
        <span className="pipe-tasks">
          {SCREENING_TASKS.map((task) => {
            const ok = checks[task.key];
            return (
              <span key={task.key} className={cn("pipe-task", ok && "is-on")}>
                <span aria-hidden>{ok ? "✓" : "·"}</span>
                {task.label}
              </span>
            );
          })}
        </span>
      </Link>
    </li>
  );
}

export function PipelineDesk() {
  const [properties, setProperties] = useState(getAllProperties);
  const [applicants, setApplicants] = useState<Applicant[]>(getAllApplications);

  useEffect(() => {
    setApplicants(loadDeskApplicants());
    setProperties(getAllProperties());
  }, []);

  const homes = useMemo(() => sortHomes(properties), [properties]);

  return (
    <Reveal>
      <DeskToolbar meta="Homes · applicants · demo sync">
        <span className="desk-pill is-on">Pipeline</span>
      </DeskToolbar>

      <div className="pipe-grid">
        {homes.map((property) => {
          const rows = applicants.filter((row) => row.propertyId === property.id);
          return (
            <article key={property.id} className="pipe-home">
              <Link
                href={`/dashboard/listings/${property.id}`}
                className="block"
                aria-label={`Open listing ${shortAddress(property.address)}`}
              >
                <HomePhoto property={property} />
                <div className="px-3.5 pt-3">
                  <p className="text-[15px] font-semibold tracking-[-0.24px] text-ink">
                    {shortAddress(property.address)}
                  </p>
                  <p className="mt-0.5 text-[12px] font-medium text-mute">
                    {property.bedrooms} bed · {property.bathrooms} bath · $
                    {property.rent.toLocaleString()}/mo
                  </p>
                </div>
              </Link>
              <ul className="mt-3 border-t border-line">
                {rows.length ? (
                  rows.map((applicant) => (
                    <ApplicantRow key={applicant.id} applicant={applicant} />
                  ))
                ) : (
                  <li className="px-3.5 py-3 text-[12px] font-medium text-mute">No applicants yet.</li>
                )}
              </ul>
            </article>
          );
        })}
      </div>
    </Reveal>
  );
}
