"use client";

import Image from "next/image";
import { DemoShell } from "@/components/demos/shell";
import { ANAHEIM_PHOTOS } from "@/lib/data/mock-data";
import { resetting, useDemoLoop, wipeProgress } from "@/lib/demos/loop";

export function PhotoEnhanceDemo() {
  const { ref, phase, reduce } = useDemoLoop(8000);
  const reset = resetting(phase);
  const wipe = reduce ? 1 : wipeProgress(phase);

  return (
    <div ref={ref}>
      <DemoShell reset={reset}>
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-[12px] font-medium text-mute">510 S Resh St · CSS grade</p>
          <span className="desk-pill is-on">{wipe > 0.85 ? "Enhanced" : "Original"}</span>
        </div>
        <div className="relative aspect-[16/9] overflow-hidden rounded-md border border-line bg-mist">
          <Image
            src={ANAHEIM_PHOTOS[2]}
            alt="510 S Resh St living room, original"
            fill
            sizes="(min-width: 768px) 520px, 100vw"
            className="object-cover"
          />
          <div
            className="demo-wipe absolute inset-0 overflow-hidden"
            style={{ transform: `translateX(${(1 - wipe) * 100}%)` }}
          >
            <div
              className="absolute inset-0"
              style={{ transform: `translateX(${-(1 - wipe) * 100}%)` }}
            >
              <Image
                src={ANAHEIM_PHOTOS[2]}
                alt=""
                fill
                sizes="(min-width: 768px) 520px, 100vw"
                className="photo-enhance object-cover"
              />
            </div>
          </div>
        </div>
      </DemoShell>
    </div>
  );
}
