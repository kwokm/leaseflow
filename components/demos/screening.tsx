"use client";

import { DemoShell } from "@/components/demos/shell";
import { resetting, storyOn, useDemoLoop } from "@/lib/demos/loop";

const CHECKS = [
  { at: 0.14, label: "Photo ID", note: "Name matches the applicant" },
  { at: 0.3, label: "Experian", note: "Demo pull · landlord not charged" },
  { at: 0.46, label: "AI income check", note: "Name match · last two months" },
  { at: 0.62, label: "Background", note: "Mock public-records note" },
] as const;

export function ScreeningDemo() {
  const { ref, phase } = useDemoLoop(10000);
  const reset = resetting(phase);

  return (
    <div ref={ref}>
      <DemoShell reset={reset}>
        <p className="text-[12px] font-medium text-mute">Jane Doe · 510 S Resh St</p>
        <ul className="mt-3 space-y-2">
          {CHECKS.map((row) => {
            const on = storyOn(phase, row.at);
            return (
              <li
                key={row.label}
                className="flex items-start justify-between gap-3 rounded-md border border-line px-3 py-2.5"
              >
                <div>
                  <p className="text-[13px] font-semibold text-ink">{row.label}</p>
                  <p className="mt-0.5 text-[12px] font-medium text-mute">{row.note}</p>
                </div>
                <span className={`desk-pill ${on ? "is-on" : ""}`}>{on ? "Checked" : "Waiting"}</span>
              </li>
            );
          })}
        </ul>
      </DemoShell>
    </div>
  );
}
