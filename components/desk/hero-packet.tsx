'use client';

import Image from "next/image";
import { DemoPlay } from "@/components/demos/shell";
import { PacketWindow } from "@/components/desk/packet-window";
import { FEATURED_PHOTOS } from "@/lib/data/mock-data";
import { cn } from "@/lib/utils";

const ID_CHECKS = [
  { motion: "p-check-a", label: "Photo ID", note: "Front and back · name matches Jane Doe" },
  { motion: "p-check-b", label: "Experian", note: "VantageScore 3.0 · Sample" },
  { motion: "p-check-c", label: "AI Income Check / bank", note: "Paystubs and statements · last two months" },
] as const;

const PROOF_ROWS = [
  { motion: "p-row-a", file: "Paystub · Jul 2026", note: "Jane Doe · last two months" },
  { motion: "p-row-b", file: "Paystub · Aug 2026", note: "Jane Doe · last two months" },
  { motion: "p-row-c", file: "Bank · Jul–Aug 2026", note: "Jane Doe · name match" },
] as const;

/** Living packet for the landing hero. Assembles on a CSS loop; frozen when reduced-motion. */
export function HeroPacket() {
  return (
    <div className="hero-packet">
      <DemoPlay flush className="pillar-demo">
        <PacketWindow title="Application packet · Jane Doe" meta="Screening · Standard" stamp="SAMPLE">
          <div className="px-3.5 py-3 sm:px-4 sm:py-4">
            <div className="d p-chip-a relative h-20 overflow-hidden rounded-md border border-line bg-mist sm:h-24">
              <Image
                src={FEATURED_PHOTOS[0]}
                alt=""
                fill
                sizes="520px"
                className="object-cover"
              />
            </div>

            <div className="mt-3 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[13px] font-semibold tracking-[-0.16px] text-ink">
                  Jane Doe · 170 Chorus
                </p>
                <p className="mt-0.5 text-[12px] font-medium text-mute">
                  Standard · applicants pay $24.99
                </p>
              </div>
              <span className="pillar-pill">Included · $0 landlord extra</span>
            </div>

            <div className="d p-score mt-3 flex items-end justify-between gap-3 rounded-md bg-wash px-3 py-2.5">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-mute-2">
                  Experian score
                </p>
                <p className="num mt-0.5 text-[28px] font-semibold leading-none tracking-[-0.6px] text-ink">
                  724
                </p>
              </div>
              <p className="text-[12px] font-medium text-mute">Ticks in · Sample</p>
            </div>

            <ul className="mt-2.5 space-y-1.5">
              {ID_CHECKS.map((row) => (
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

            <ul className="mt-2.5 space-y-1.5">
              {PROOF_ROWS.map((doc) => (
                <li
                  key={doc.file}
                  className={cn("d rounded-md border border-line bg-paper px-3 py-2", doc.motion)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold tracking-[-0.16px] text-ink">{doc.file}</p>
                      <p className="mt-0.5 text-[11px] font-medium text-mute">{doc.note}</p>
                    </div>
                    <span className="flex flex-wrap justify-end gap-1">
                      <span className="status status-ok">Match</span>
                      <span className="status status-ok">Current</span>
                    </span>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-3 flex flex-wrap gap-1.5">
              <span className="d p-chip-b pillar-chip">Experian 724</span>
              <span className="d p-chip-c pillar-chip">Income · match</span>
              <span className="d p-chip-d pillar-chip is-score">LeaseScore 724</span>
            </div>
          </div>
        </PacketWindow>
      </DemoPlay>
    </div>
  );
}
