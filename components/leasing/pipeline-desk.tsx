"use client";

import Link from "next/link";
import { DeskPill, DeskToolbar } from "@/components/desk/packet-window";
import { PhoneDemo } from "@/components/demos/phone";
import { PipelineFunnelDemo } from "@/components/demos/pipeline-funnel";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { PIPELINE_UNITS, pricingLabel, unitStatusLabel } from "@/lib/leasing/ops";
import { useLeases } from "@/lib/leasing/store";
import { shortAddress } from "@/lib/desk/display";

export function PipelineDesk() {
  const leases = useLeases();
  const signedExtra = leases.filter(
    (row) => row.status === "signed" || row.status === "deposit_queued",
  ).length;

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
        {signedExtra ? <span className="desk-pill">{signedExtra} signed here</span> : null}
      </DeskToolbar>

      <div className="space-y-6 border-b border-line">
        <PipelineFunnelDemo />
      </div>

      <div className="space-y-6 px-5 py-5 sm:px-6">
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

        <section className="overflow-hidden rounded-md border border-line">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3">
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
          <PhoneDemo />
        </section>
      </div>
    </Reveal>
  );
}
