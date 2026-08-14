"use client";

import { DemoLine, DemoShell } from "@/components/demos/shell";
import { resetting, storyOn, useDemoLoop } from "@/lib/demos/loop";

const POSTS = [
  { at: 0.16, name: "Facebook", title: "510 S Resh St" },
  { at: 0.3, name: "Craigslist", title: "3BR · The Colony" },
  { at: 0.44, name: "Facebook", title: "HotPads cross-post" },
] as const;

export function MarketplaceDemo() {
  const { ref, phase } = useDemoLoop(12000);
  const reset = resetting(phase);

  return (
    <div ref={ref}>
      <DemoShell reset={reset}>
        <p className="text-[12px] font-medium text-mute">Marketplace · Demo sync</p>
        <ul className="mt-3 space-y-2">
          {POSTS.map((post) => {
            const live = storyOn(phase, post.at);
            return (
              <li
                key={`${post.name}-${post.title}`}
                className="flex items-center justify-between gap-3 rounded-md border border-line px-3 py-2.5"
              >
                <div>
                  <p className="text-[13px] font-semibold text-ink">{post.name}</p>
                  <p className="mt-0.5 text-[12px] font-medium text-mute">{post.title}</p>
                </div>
                <span className={`desk-pill ${live ? "is-on" : ""}`}>
                  {live ? "Live" : "Queued"}
                </span>
              </li>
            );
          })}
        </ul>
        <div className="mt-3 space-y-2">
          <DemoLine
            on={storyOn(phase, 0.56)}
            className="max-w-[90%] rounded-btn border border-line bg-mist px-3 py-2 text-[13px] font-medium"
          >
            Chris · Facebook — Still available? What’s the move-in?
          </DemoLine>
          <DemoLine
            on={storyOn(phase, 0.7)}
            className="ml-auto max-w-[90%] rounded-btn border border-line bg-rail px-3 py-2 text-[13px] font-medium"
          >
            Available September 1. I can book Tuesday or Thursday. Demo sync.
          </DemoLine>
        </div>
      </DemoShell>
    </div>
  );
}
