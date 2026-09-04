"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { DemoPlay } from "@/components/demos/shell";
import { FEATURED_PHOTOS } from "@/lib/data/mock-data";
import { cn } from "@/lib/utils";

const APPLY_STAGES = [
  { motion: "s-stage-a", label: "You" },
  { motion: "s-stage-b", label: "Proof" },
  { motion: "s-stage-c", label: "Credit" },
  { motion: "s-stage-d", label: "Pay" },
] as const;

function StepStage({ children }: { children: ReactNode }) {
  return (
    <div className="step-graphic overflow-hidden rounded-md border border-line bg-paper">
      {children}
    </div>
  );
}

/** 01 — listing card assembles: photo, address, rent, fee. */
export function StepAddListing() {
  return (
    <DemoPlay flush className="step-demo">
      <StepStage>
        <div className="d s-photo relative h-16 overflow-hidden bg-mist">
          <Image
            src={FEATURED_PHOTOS[0]}
            alt=""
            fill
            sizes="320px"
            className="object-cover"
          />
        </div>
        <div className="space-y-1.5 px-3 py-2.5">
          <p className="d s-field-a text-[13px] font-medium text-ink">170 Chorus</p>
          <p className="d s-field-b text-[13px] font-medium text-mute">
            4 bed · 3.5 bath · <span className="num">$6,500</span>/mo
          </p>
          <p className="d s-field-c text-[13px] font-medium text-mute">
            Standard · applicants pay $24.99
          </p>
        </div>
      </StepStage>
    </DemoPlay>
  );
}

/** 02 — apply link copies, then text / email light up. */
export function StepShareLink() {
  return (
    <DemoPlay flush className="step-demo">
      <StepStage>
        <div className="space-y-2 px-3 py-3">
          <div className="d s-link flex items-center justify-between gap-2 rounded-md bg-wash px-2.5 py-2">
            <p className="min-w-0 truncate text-[13px] font-medium text-ink">
              Apply link · 170 Chorus
            </p>
            <span className="pillar-flip shrink-0">
              <span className="d s-copy-off status">Copy</span>
              <span className="d s-copy-on status status-ok">Copied</span>
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <span className="d s-send-a pillar-chip">Text</span>
            <span className="d s-send-b pillar-chip">Email</span>
          </div>
        </div>
      </StepStage>
    </DemoPlay>
  );
}

/** 03 — You → Proof → Credit → Pay ticks in. */
export function StepTheyApply() {
  return (
    <DemoPlay flush className="step-demo">
      <StepStage>
        <ul className="grid grid-cols-4 gap-1 px-2.5 py-3">
          {APPLY_STAGES.map((stage) => (
            <li key={stage.label} className={cn("d text-center", stage.motion)}>
              <span className="pillar-tick mx-auto">✓</span>
              <p className="mt-1.5 text-[13px] font-medium text-ink">{stage.label}</p>
            </li>
          ))}
        </ul>
      </StepStage>
    </DemoPlay>
  );
}

/** 04 — packet row lands; Approve lights up. */
export function StepYouDecide() {
  return (
    <DemoPlay flush className="step-demo">
      <StepStage>
        <div className="d s-row px-3 py-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[13px] font-medium text-ink">Jane Doe · 170 Chorus</p>
              <p className="mt-0.5 text-[13px] font-medium text-mute">
                Experian 724 · $8,500 / mo
              </p>
            </div>
            <span className="sample-stamp">SAMPLE</span>
          </div>
          <div className="mt-2.5 flex gap-1.5">
            <span className="d s-approve inline-flex h-7 items-center rounded-btn bg-ok-bg px-2.5 text-[13px] font-medium text-ok">
              Approve
            </span>
            <span className="inline-flex h-7 items-center rounded-btn border border-line px-2.5 text-[13px] font-medium text-mute">
              Decline
            </span>
          </div>
        </div>
      </StepStage>
    </DemoPlay>
  );
}
