'use client';

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { DeskToolbar } from "@/components/desk/packet-window";
import { StatusPill } from "@/components/desk/status-pill";
import { Avatar } from "@/components/desk/avatar";
import { AiIncomeLine, HouseholdSummary } from "@/components/desk/household-block";
import { Reveal } from "@/components/motion/reveal";
import { ApplyLinkActions } from "@/components/listings/apply-link-actions";
import { Button } from "@/components/ui/button";
import {
  FEATURED_LISTING_ID,
  getAllApplications,
  mockProperties,
  type Applicant,
  type Property,
} from "@/lib/data/mock-data";
import { useProperties } from "@/lib/listings/use-property";
import { useDeskApplicants } from "@/lib/desk/use-desk-applicants";
import { shortAddress } from "@/lib/desk/display";
import { householdTotals, householdsFirst } from "@/lib/desk/household";
import { SCREENING_TASKS, screeningChecks } from "@/lib/desk/screening";
import { listingThumb } from "@/lib/listings/store";
import { networkLabel, SocialGrid } from "@/components/desk/social-grid";
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

  const remote = /^https?:\/\//i.test(src) && !/zillowstatic\.com|d36xftgacqn2p\.cloudfront\.net|cdn-redfin\.com|rdcpix\.com/i.test(src);

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

function ApplicantRow({
  applicant,
  preview,
  nested = false,
}: {
  applicant: Applicant;
  preview: boolean;
  nested?: boolean;
}) {
  const name = `${applicant.firstName} ${applicant.lastName}`;
  const checks = screeningChecks(applicant);
  const content = (
    <>
      <span className="flex min-w-0 items-center gap-2">
        <Avatar
          firstName={applicant.firstName}
          lastName={applicant.lastName}
          photoUrl={applicant.profile?.photoUrl}
        />
        <span className="min-w-0">
          <span className="block truncate text-[13px] font-semibold tracking-[-0.16px] text-ink">
            {name}
            {nested ? (
              <span className="ml-1.5 text-[11px] font-medium text-mute">Co-tenant</span>
            ) : null}
            {applicant.profile?.sample ? (
              <span className="ml-1.5 text-[10px] font-medium uppercase tracking-[0.06em] text-mute-2">
                SAMPLE
              </span>
            ) : null}
          </span>
          <StatusPill status={applicant.status} className="mt-1" />
          {applicant.profile?.bio ? (
            <span className="mt-1 block text-[12px] font-medium leading-4 text-mute">
              {applicant.profile.bio}
            </span>
          ) : null}
          <span className="mt-1 block">
            <AiIncomeLine applicant={applicant} />
          </span>
          {applicant.profile?.social.map((account) => (
            <SocialGrid
              key={account.network}
              compact
              label={networkLabel(account.network)}
              posts={account.posts}
            />
          ))}
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

  if (preview) {
    return <div className="pipe-applicant">{content}</div>;
  }

  return (
    <Link
      href={`/dashboard/applications/${applicant.id}`}
      className="pipe-applicant"
      aria-label={`Open packet for ${name}`}
    >
      {content}
    </Link>
  );
}

export function PipelineDesk({ preview = false }: { preview?: boolean }) {
  // `preview` is the static marketing pipeline on the landing page. The real
  // desk reads listings and the queue from the server, which decides whether
  // the seeded homes are included (LEASEPROOF_DEMO).
  const { properties, ready: propertiesReady, unavailable } = useProperties();
  const { applicants: deskApplicants } = useDeskApplicants();

  const source: Property[] = preview ? mockProperties : properties;
  const applicants: Applicant[] = preview ? getAllApplications() : deskApplicants;
  const homes = useMemo(() => sortHomes(source), [source]);

  // Do not flash the empty state while the first fetch is still in flight.
  const showEmpty = homes.length === 0 && (preview || propertiesReady);

  return (
    <Reveal>
      <DeskToolbar meta={preview ? "Homes · applicants · preview" : `${homes.length} properties`}>
        <span className="desk-pill is-on">Pipeline</span>
      </DeskToolbar>

      {homes.length === 0 && !showEmpty ? null : showEmpty && unavailable ? (
        <section className="px-5 py-12 sm:px-6">
          <p className="text-[12px] font-medium uppercase tracking-[0.06em] text-mute-2">
            Pipeline
          </p>
          <h1 className="mt-2 text-[24px] font-semibold tracking-[-0.5px] text-ink">
            We can&rsquo;t load your listings right now.
          </h1>
          <p className="mt-2 max-w-xl text-[14px] font-medium leading-5 text-mute">
            Nothing has been lost — the pipeline just isn&rsquo;t answering. Reload in a moment.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button type="button" onClick={() => window.location.reload()}>
              Reload
            </Button>
          </div>
        </section>
      ) : showEmpty ? (
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
              <Link href="/dashboard/listings/new">Add listing</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard/listings/new?mode=import">Import listing</Link>
            </Button>
          </div>
        </section>
      ) : (
      <div className="pipe-grid">
        {homes.map((property) => {
          const rows = applicants.filter((row) => row.propertyId === property.id);
          const groups = householdsFirst(rows);
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
                {groups.length ? (
                  groups.map((group) => {
                    if (group.kind === "solo") {
                      return (
                        <li key={group.applicant.id}>
                          <ApplicantRow applicant={group.applicant} preview={preview} />
                        </li>
                      );
                    }

                    const totals = householdTotals(group.members, property.rent);
                    return (
                      <li key={group.householdId} className="pipe-household">
                        <div className="pipe-household-head">
                          <HouseholdSummary totals={totals} />
                        </div>
                        {group.members.map((member) => (
                          <ApplicantRow
                            key={member.id}
                            applicant={member}
                            preview={preview}
                            nested
                          />
                        ))}
                      </li>
                    );
                  })
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
