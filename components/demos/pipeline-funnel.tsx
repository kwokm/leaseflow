"use client";

import { DemoShell } from "@/components/demos/shell";
import { PIPELINE_COUNTS } from "@/lib/leasing/ops";
import { countTo, resetting, storyOn, useDemoLoop } from "@/lib/demos/loop";

const COUNTS = [
  { label: "Leads", target: PIPELINE_COUNTS.leads, start: 0.04, end: 0.32 },
  { label: "Bookings", target: PIPELINE_COUNTS.bookings, start: 0.1, end: 0.38 },
  { label: "Applications", target: PIPELINE_COUNTS.applications, start: 0.16, end: 0.44 },
  { label: "Signed", target: PIPELINE_COUNTS.signed, start: 0.22, end: 0.5 },
] as const;

export function PipelineFunnelDemo() {
  const { ref, phase } = useDemoLoop(11000);
  const reset = resetting(phase);
  const reviewing = storyOn(phase, 0.56);

  return (
    <div ref={ref}>
      <DemoShell reset={reset}>
        <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {COUNTS.map((row) => (
            <div key={row.label} className="rounded-md border border-line bg-mist/40 px-3 py-2.5">
              <dt className="text-[11px] font-medium text-mute-2">{row.label}</dt>
              <dd className="num mt-0.5 text-[20px] font-semibold tracking-[-0.4px] text-ink">
                {countTo(phase, row.target, row.start, row.end)}
              </dd>
            </div>
          ))}
        </dl>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-md border border-line px-3 py-3">
          <div>
            <p className="text-[14px] font-semibold tracking-[-0.2px] text-ink">510 S Resh St</p>
            <p className="mt-0.5 text-[12px] font-medium text-mute">3 bed · $4,700/mo · Anaheim</p>
          </div>
          <span className={`desk-pill ${reviewing ? "is-on" : ""}`}>
            {reviewing ? "Application review" : "Ready to tour"}
          </span>
        </div>
      </DemoShell>
    </div>
  );
}
