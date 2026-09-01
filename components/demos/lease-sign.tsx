"use client";

import { DemoPlay } from "@/components/demos/shell";

const STEPS: readonly { label: string; note: string; active?: boolean }[] = [
  { label: "Approved", note: "Packet decided" },
  { label: "Lease generated", note: "Same PacketWindow" },
  { label: "E-sign pending", note: "Dummy sign", active: true },
  { label: "Deposit queued", note: "ACH · demo" },
];

export function LeaseSignDemo() {
  return (
    <DemoPlay>
      <p className="text-[12px] font-medium text-mute">Jane Doe · 510 S Resh St</p>
      <ol className="mt-3 space-y-2">
        {STEPS.map((step, index) => (
          <li
            key={step.label}
            className="d d-enter-lease relative overflow-hidden rounded-md border border-line px-3 py-2.5"
            style={{ animationDelay: `${index * 140}ms` }}
          >
            {step.active ? (
              <span className="d d-glow-lease pointer-events-none absolute inset-0 rounded-[inherit] border border-[#c4b8dc]" />
            ) : null}
            <div className="relative flex items-center justify-between gap-3">
              <div>
                <p className="text-[13px] font-semibold text-ink">{step.label}</p>
                <p className="mt-0.5 text-[12px] font-medium text-mute">{step.note}</p>
              </div>
              <span className={`desk-pill ${step.active ? "is-on" : ""}`}>
                {step.active ? "Active" : index < 2 ? "Done" : "Queued"}
              </span>
            </div>
          </li>
        ))}
      </ol>
    </DemoPlay>
  );
}
