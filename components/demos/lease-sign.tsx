"use client";

import { DemoShell } from "@/components/demos/shell";
import { resetting, storyOn, useDemoLoop } from "@/lib/demos/loop";
import { cn } from "@/lib/utils";

const STEPS = [
  { at: 0.12, label: "Approved", note: "Packet decided" },
  { at: 0.3, label: "Lease generated", note: "Same PacketWindow" },
  { at: 0.48, label: "E-sign", note: "Dummy sign" },
  { at: 0.66, label: "Deposit queued", note: "ACH · demo" },
] as const;

export function LeaseSignDemo() {
  const { ref, phase, reduce } = useDemoLoop(12000);
  const reset = resetting(phase);
  const lastOn = storyOn(phase, 0.66);
  const awaiting = !reduce && storyOn(phase, 0.48) && !lastOn;

  return (
    <div ref={ref}>
      <DemoShell reset={reset}>
        <p className="text-[12px] font-medium text-mute">Jane Doe · 510 S Resh St</p>
        <ol className="mt-3 space-y-2">
          {STEPS.map((step, index) => {
            const on = storyOn(phase, step.at);
            const pulse = index === 2 && awaiting;
            return (
              <li
                key={step.label}
                className="flex items-center justify-between gap-3 rounded-md border border-line px-3 py-2.5"
              >
                <div>
                  <p className="text-[13px] font-semibold text-ink">{step.label}</p>
                  <p className="mt-0.5 text-[12px] font-medium text-mute">{step.note}</p>
                </div>
                <span
                  className={cn(
                    "desk-pill",
                    on && "is-on",
                    pulse && "demo-pulse",
                  )}
                >
                  {index === 2 && awaiting ? "Awaiting" : on ? "Done" : "Next"}
                </span>
              </li>
            );
          })}
        </ol>
      </DemoShell>
    </div>
  );
}
