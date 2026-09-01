"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { DeskToolbar } from "@/components/desk/packet-window";
import { StatusPill } from "@/components/desk/status-pill";
import { Avatar } from "@/components/desk/avatar";
import { Reveal } from "@/components/motion/reveal";
import { ApplyLinkActions } from "@/components/listings/apply-link-actions";
import { Button } from "@/components/ui/button";
import {
  FEATURED_LISTING_ID,
  getAllApplications,
  getAllProperties,
  loadDemoData,
  mockProperties,
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

function ApplicantRow({ applicant, preview }: { applicant: Applicant; preview: boolean }) {
  const name = `${applicant.firstName} ${applicant.lastName}`;
  const checks = screeningChecks(applicant);
  const content = (
    <>
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
    </>
  );

  return (
    <li>
      {preview ? (
        <div className="pipe-applicant">{content}</div>
      ) : (
        <Link
          href={`/dashboard/applications/${applicant.id}`}
          className="pipe-applicant"
          aria-label={`Open packet for ${name}`}
        >
          {content}
        </Link>
      )}
    </li>
  );
}

export function PipelineDesk({ preview = false }: { preview?: boolean }) {
  const [properties, setProperties] = useState<Property[]>(() =>
    preview ? mockProperties : getAllProperties()
  );
  const [applicants, setApplicants] = useState<Applicant[]>(() =>
    preview ? getAllApplications() : []
  );

  useEffect(() => {
    setApplicants(preview ? getAllApplications() : loadDeskApplicants());
    setProperties(preview ? mockProperties : getAllProperties());
  }, [preview]);

  const homes = useMemo(() => sortHomes(properties), [properties]);

  function loadDemo() {
    loadDemoData();
    setApplicants(loadDeskApplicants(true));
    setProperties(getAllProperties());
  }

  return (
    <Reveal>
      <DeskToolbar meta={preview ? "Homes · applicants · preview" : `${homes.length} properties`}>
        <span className="desk-pill is-on">Pipeline</span>
      </DeskToolbar>

      {homes.length === 0 ? (
        <section className="px-5 py-12 sm:px-6">
          <p className="text-[12px] font-medium uppercase tracking-[0.06em] text-mute-2">
            Step 1
          </p>
          <h1 className="mt-2 text-[24px] font-semibold tracking-[-0.5px] text-ink">
            Create a listing, then share its apply link.
          </h1>
          <p className="mt-2 max-w-xl text-[14px] font-medium leading-5 text-mute">
            Add one property to open an empty screening pipeline. From there you can invite renters
            or copy the link anywhere.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/dashboard/listings/new">Create listing + get apply link</Link>
            </Button>
            <Button type="button" variant="ghost" onClick={loadDemo}>
              Load demo
            </Button>
          </div>
        </section>
      ) : (
      <div className="pipe-grid">
        {homes.map((property) => {
          const rows = applicants.filter((row) => row.propertyId === property.id);
          const summary = (
            <>
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
            </>
          );

          return (
            <article key={property.id} className="pipe-home">
              {preview ? (
                <div>{summary}</div>
              ) : (
                <Link
                  href={`/dashboard/listings/${property.id}`}
                  className="block"
                  aria-label={`Open listing ${shortAddress(property.address)}`}
                >
                  {summary}
                </Link>
              )}
              <ul className="mt-3 border-t border-line">
                {rows.length ? (
                  rows.map((applicant) => (
                    <ApplicantRow key={applicant.id} applicant={applicant} preview={preview} />
                  ))
                ) : (
                  <li className="space-y-3 px-3.5 py-3 text-[12px] font-medium text-mute">
                    <p>No applicants yet.</p>
                    {!preview ? (
                      <ApplyLinkActions
                        listingId={property.id}
                        address={property.address}
                        compact
                      />
                    ) : null}
                  </li>
                )}
              </ul>
            </article>
          );
        })}
      </div>
      )}
    </Reveal>
  );
}
