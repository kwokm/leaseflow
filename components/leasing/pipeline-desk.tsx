"use client";

import Link from "next/link";
import { DeskPill, DeskToolbar } from "@/components/desk/packet-window";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import {
  PIPELINE_COUNTS,
  PIPELINE_UNITS,
  PHONE_TRANSCRIPT,
  pricingLabel,
  unitStatusLabel,
} from "@/lib/leasing/ops";
import { useLeases } from "@/lib/leasing/store";
import { shortAddress } from "@/lib/desk/display";

export function PipelineDesk() {
  const leases = useLeases();
  const signedExtra = leases.filter(
    (row) => row.status === "signed" || row.status === "deposit_queued",
  ).length;

  const counts = [
    ["Leads", PIPELINE_COUNTS.leads],
    ["Bookings", PIPELINE_COUNTS.bookings],
    ["Applications", PIPELINE_COUNTS.applications],
    ["Signed leases", PIPELINE_COUNTS.signed + signedExtra],
  ] as const;

  return (
    <Reveal>
      <DeskToolbar meta="Demo sync · mock pipeline">
        <DeskPill active>Vacant units</DeskPill>
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard/applications">Application queue</Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard/leads">Lead inbox</Link>
        </Button>
      </DeskToolbar>

      <div className="space-y-6 px-5 py-5 sm:px-6">
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {counts.map(([label, value]) => (
            <div key={label} className="rounded-md border border-line bg-mist/40 px-3 py-3">
              <dt className="text-[12px] font-medium text-mute-2">{label}</dt>
              <dd className="num mt-0.5 text-[20px] font-semibold tracking-[-0.4px] text-ink">
                {value}
              </dd>
            </div>
          ))}
        </dl>

        <ul className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {PIPELINE_UNITS.map((unit) => (
            <li key={unit.id}>
              <Link
                href={`/dashboard/listings/${unit.id}`}
                className="block rounded-md border border-line bg-paper p-4 transition-colors duration-200 hover:bg-mist/50"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="text-[15px] font-semibold tracking-[-0.24px] text-ink">
                    {shortAddress(unit.address)}
                  </p>
                  <span className="desk-pill is-on">{unitStatusLabel(unit.status)}</span>
                </div>
                <p className="mt-1 text-[13px] font-medium text-mute">
                  {unit.beds} bed · {unit.baths} bath · ${unit.rent.toLocaleString()}/mo
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <span className="desk-pill">{pricingLabel(unit.pricing)} · demo</span>
                  <span className="desk-pill">
                    {unit.syndication === "live" ? "Syndication live" : "Syndication pending"}
                  </span>
                  <span className="desk-pill">{unit.leads} leads</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>

        <section className="rounded-md border border-line bg-paper p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-[14px] font-semibold tracking-[-0.2px] text-ink">AI phone</p>
              <p className="mt-0.5 text-[12px] font-medium text-mute">
                Demo transcript — not a live dialer.
              </p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard/showings">Open Tuesday route</Link>
            </Button>
          </div>
          <ol className="mt-4 space-y-3">
            {PHONE_TRANSCRIPT.map((line, index) => (
              <li
                key={`${line.from}-${index}`}
                className={
                  line.from === "agent"
                    ? "ml-6 rounded-btn border border-line bg-rail px-3.5 py-2.5"
                    : "mr-6 rounded-btn border border-line bg-mist px-3.5 py-2.5"
                }
              >
                <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-mute-2">
                  {line.from === "agent" ? "Leaseproof agent" : "Caller"}
                </p>
                <p className="mt-1 text-[13px] font-medium leading-5 text-ink">{line.body}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </Reveal>
  );
}
