'use client';

import Image from "next/image";
import { DemoPlay } from "@/components/demos/shell";
import { PacketWindow } from "@/components/desk/packet-window";
import { FEATURED_PHOTOS } from "@/lib/data/mock-data";
import { cn } from "@/lib/utils";

const EXPERIAN_CHECKS = [
  { motion: "p-check-a", label: "Photo ID", note: "Name matches Jane Doe" },
  { motion: "p-check-b", label: "Credit", note: "VantageScore 3.0 · Sample" },
  { motion: "p-check-c", label: "Background", note: "Sample" },
] as const;

export function PillarExperian() {
  return (
    <DemoPlay flush className="pillar-demo">
      <PacketWindow title="Experian · Jane Doe" meta="Sample" stamp="SAMPLE">
        <div className="px-3.5 py-3 sm:px-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[12px] font-medium text-mute">Jane Doe · 170 Chorus</p>
            <span className="pillar-pill">Included · $0 landlord extra</span>
          </div>
          <div className="d p-score mt-3 flex items-end justify-between gap-3 rounded-md bg-wash px-3 py-2.5">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-mute-2">
                Credit score
              </p>
              <p className="num mt-0.5 text-[28px] font-semibold leading-none tracking-[-0.6px] text-ink">
                724
              </p>
            </div>
            <p className="text-[12px] font-medium text-mute">Landlord not charged</p>
          </div>
          <ul className="mt-2.5 space-y-1.5">
            {EXPERIAN_CHECKS.map((row) => (
              <li
                key={row.label}
                className={cn("d flex items-center justify-between gap-3 rounded-md px-1 py-1", row.motion)}
              >
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold tracking-[-0.16px] text-ink">{row.label}</p>
                  <p className="text-[11px] font-medium text-mute">{row.note}</p>
                </div>
                <span className="pillar-tick">✓</span>
              </li>
            ))}
          </ul>
        </div>
      </PacketWindow>
    </DemoPlay>
  );
}

const INCOME_DOCS = [
  {
    motion: "p-row-a",
    file: "Paystub · Jul 2026",
    note: "Jane Doe · last two months",
    flip: true,
  },
  {
    motion: "p-row-b",
    file: "Paystub · Aug 2026",
    note: "Jane Doe · last two months",
    flip: false,
  },
  {
    motion: "p-row-c",
    file: "Bank · Jul–Aug 2026",
    note: "Jane Doe · name match",
    flip: false,
  },
] as const;

export function PillarIncome() {
  return (
    <DemoPlay flush className="pillar-demo">
      <PacketWindow title="AI Income Check · Jane Doe" meta="Name + recency" stamp="SAMPLE">
        <div className="px-3.5 py-3 sm:px-4">
          <p className="text-[12px] font-medium text-mute">
            Paystubs and statements. Names match. Last two months.
          </p>
          <ul className="mt-2.5 space-y-1.5">
            {INCOME_DOCS.map((doc) => (
              <li
                key={doc.file}
                className={cn("d rounded-md border border-line bg-paper px-3 py-2", doc.motion)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold tracking-[-0.16px] text-ink">{doc.file}</p>
                    <p className="mt-0.5 text-[11px] font-medium text-mute">{doc.note}</p>
                  </div>
                  {doc.flip ? (
                    <span className="pillar-flip">
                      <span className="d p-miss status status-no">Mismatch</span>
                      <span className="d p-fix status status-ok">Match</span>
                    </span>
                  ) : (
                    <span className="flex flex-wrap justify-end gap-1">
                      <span className="status status-ok">Match</span>
                      <span className="status status-ok">Current</span>
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </PacketWindow>
    </DemoPlay>
  );
}

export function PillarPacket() {
  return (
    <DemoPlay flush className="pillar-demo">
      <PacketWindow title="Shared packet · Jane Doe" meta="Sample" stamp="SAMPLE">
        <div className="px-3.5 py-3 sm:px-4">
          <div className="d p-chip-a relative h-16 overflow-hidden rounded-md border border-line bg-mist">
            <Image
              src={FEATURED_PHOTOS[0]}
              alt=""
              fill
              sizes="280px"
              className="object-cover"
            />
          </div>
          <p className="mt-2 text-[12px] font-semibold tracking-[-0.14px] text-ink">170 Chorus</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className="d p-chip-b pillar-chip">Experian 724</span>
            <span className="d p-chip-c pillar-chip">Income · match</span>
            <span className="d p-chip-d pillar-chip is-score">LeaseScore 724</span>
          </div>
          <p className="mt-3 text-[13px] font-medium text-mute">
            Shared packet · everyone can open
          </p>
        </div>
      </PacketWindow>
    </DemoPlay>
  );
}
