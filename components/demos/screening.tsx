'use client';

import { DemoPlay } from "@/components/demos/shell";

const CHECKS = [
  { label: "Photo ID", note: "Name matches the applicant", retick: "1s" },
  { label: "Experian", note: "Demo pull · landlord not charged", retick: "1.5s" },
  { label: "AI income check", note: "Gross monthly from paystubs / W-2", retick: "2s" },
  { label: "Background", note: "Mock public-records note", retick: "2.5s" },
] as const;

export function ScreeningDemo() {
  return (
    <DemoPlay>
      <p className="text-[12px] font-medium text-mute">Jane Doe · 170 Chorus</p>
      <ul className="mt-3 space-y-2">
        {CHECKS.map((row, index) => (
          <li
            key={row.label}
            className="d d-enter flex items-start justify-between gap-3 rounded-md border border-line px-3 py-2.5"
            style={{ animationDelay: `${index * 160}ms` }}
          >
            <div>
              <p className="text-[13px] font-semibold text-ink">{row.label}</p>
              <p className="mt-0.5 text-[12px] font-medium text-mute">{row.note}</p>
            </div>
            <span className="d d-retick" style={{ animationDelay: row.retick }}>
              <span
                className="d d-check desk-pill is-on"
                style={{ animationDelay: `${index * 160 + 120}ms` }}
              >
                ✓
              </span>
            </span>
          </li>
        ))}
      </ul>
    </DemoPlay>
  );
}
