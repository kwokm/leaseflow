"use client";

import { DemoLine, DemoShell } from "@/components/demos/shell";
import { resetting, storyOn, useDemoLoop } from "@/lib/demos/loop";

const BOARDS = [
  { name: "Zillow", at: 0.14 },
  { name: "Apartments.com", at: 0.26 },
  { name: "HotPads", at: 0.38 },
  { name: "Facebook", at: 0.5 },
  { name: "Craigslist", at: 0.62 },
] as const;

export function SyndicationDemo() {
  const { ref, phase } = useDemoLoop(12000);
  const reset = resetting(phase);
  const synced = storyOn(phase, 0.7);

  return (
    <div ref={ref}>
      <DemoShell reset={reset}>
        <div className="rounded-md border border-line px-3 py-3">
          <p className="text-[14px] font-semibold tracking-[-0.2px] text-ink">510 S Resh St</p>
          <p className="mt-0.5 text-[12px] font-medium text-mute">
            Anaheim · 3 bed · 2 bath · $4,700/mo
          </p>
        </div>
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {BOARDS.map((board, index) => {
            const live = storyOn(phase, board.at);
            return (
              <li key={board.name} style={{ transitionDelay: `${(index % 8) * 80}ms` }}>
                <span className={`desk-pill ${live ? "is-on" : ""}`}>
                  {board.name} · {live ? "Live" : "Pending"}
                </span>
              </li>
            );
          })}
        </ul>
        <DemoLine on={synced} className="mt-3 text-[12px] font-medium text-mute">
          Synced just now · Demo sync
        </DemoLine>
      </DemoShell>
    </div>
  );
}
