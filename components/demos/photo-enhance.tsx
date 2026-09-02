'use client';

import Image from "next/image";
import { DemoPlay } from "@/components/demos/shell";
import { FEATURED_PHOTOS } from "@/lib/data/mock-data";

const STATUSES = [
  { cls: "d-status-a", label: "Scanning room", last: false },
  { cls: "d-status-b", label: "Detecting layout", last: false },
  { cls: "d-status-c", label: "Adding furniture", last: false },
  { cls: "d-status-d", label: "Generating staged photo", last: true },
] as const;

export function PhotoEnhanceDemo() {
  return (
    <DemoPlay>
      <div className="relative mb-2 h-5">
        {STATUSES.map((row) => (
          <p
            key={row.label}
            className={`d d-status ${row.cls}${row.last ? " d-status-last" : ""} absolute inset-0 text-[12px] font-medium text-mute`}
          >
            {row.label}
          </p>
        ))}
      </div>
      <div className="relative aspect-[16/9] overflow-hidden rounded-md border border-line bg-mist">
        <Image
          src={FEATURED_PHOTOS[2]}
          alt="170 Chorus living room"
          fill
          sizes="(min-width: 768px) 520px, 100vw"
          className="object-cover"
        />
        <div className="absolute inset-0">
          <Image
            src={FEATURED_PHOTOS[2]}
            alt=""
            fill
            sizes="(min-width: 768px) 520px, 100vw"
            className="d d-enhance photo-enhance object-cover"
          />
        </div>
        <span className="d d-scan pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-transparent via-white/50 to-transparent" />
      </div>
    </DemoPlay>
  );
}
