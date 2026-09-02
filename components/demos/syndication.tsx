'use client';

import { DemoPlay } from "@/components/demos/shell";

const BOARDS = [
  { name: "Zillow", mark: "Z", float: "0s", live: "0.8s" },
  { name: "Apartments", mark: "A", float: "0.35s", live: "1.1s" },
  { name: "HotPads", mark: "H", float: "0.7s", live: "1.4s" },
  { name: "Facebook", mark: "F", float: "1s", live: "1.7s" },
  { name: "Craigslist", mark: "C", float: "1.25s", live: "2s" },
] as const;

export function SyndicationDemo() {
  return (
    <DemoPlay>
      <div className="d d-breathe rounded-md border border-line px-3 py-3">
        <p className="text-[14px] font-semibold tracking-[-0.2px] text-ink">One listing</p>
        <p className="mt-0.5 text-[12px] font-medium text-mute">
          170 Chorus · synced · Demo sync
        </p>
      </div>
      <ul className="mt-3 grid grid-cols-5 gap-1.5">
        {BOARDS.map((board) => (
          <li key={board.name} className="text-center">
            <div
              className="d d-float mx-auto flex h-10 w-10 items-center justify-center rounded-md border border-line bg-mist text-[13px] font-semibold text-ink"
              style={{ animationDelay: board.float }}
            >
              {board.mark}
            </div>
            <p className="mt-1 truncate text-[10px] font-medium text-mute">{board.name}</p>
            <span
              className="d d-live desk-pill mt-1 is-on"
              style={{ animationDelay: board.live }}
            >
              Live
            </span>
          </li>
        ))}
      </ul>
    </DemoPlay>
  );
}
