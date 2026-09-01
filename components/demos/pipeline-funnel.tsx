"use client";

import { DemoPlay } from "@/components/demos/shell";
import { PIPELINE_COUNTS } from "@/lib/leasing/ops";

const COUNTS = [
  { label: "Leads", value: PIPELINE_COUNTS.leads },
  { label: "Bookings", value: PIPELINE_COUNTS.bookings },
  { label: "Applications", value: PIPELINE_COUNTS.applications },
  { label: "Signed", value: PIPELINE_COUNTS.signed },
] as const;

export function PipelineFunnelDemo() {
  return (
    <DemoPlay>
      <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {COUNTS.map((row) => (
          <div
            key={row.label}
            className="d d-bob relative rounded-md border border-line bg-mist/40 px-3 py-2.5"
          >
            <dt className="flex items-center gap-1.5 text-[11px] font-medium text-mute-2">
              <span className="d d-dot inline-block h-1.5 w-1.5 rounded-full bg-ok" />
              {row.label}
            </dt>
            <dd className="num mt-0.5 text-[20px] font-semibold tracking-[-0.4px] text-ink">
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
      <svg
        className="mt-3 h-10 w-full"
        viewBox="0 0 240 40"
        fill="none"
        aria-hidden
      >
        <path
          className="d d-chart"
          d="M2 32 C 28 28, 40 22, 58 20 S 90 24, 110 16 S 150 8, 172 12 S 210 6, 238 4"
          stroke="#8d7bb8"
          strokeWidth="1.6"
          strokeDasharray="120"
          strokeDashoffset="120"
        />
      </svg>
      <div className="d d-bob mt-1 flex flex-wrap items-center justify-between gap-2 rounded-md border border-line px-3 py-3">
        <div>
          <p className="text-[14px] font-semibold tracking-[-0.2px] text-ink">510 S Resh St</p>
          <p className="mt-0.5 text-[12px] font-medium text-mute">3 bed · $4,700/mo · Anaheim</p>
        </div>
        <span className="desk-pill is-on">Application review</span>
      </div>
    </DemoPlay>
  );
}
