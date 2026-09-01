"use client";

import { DemoPlay } from "@/components/demos/shell";
import { cn } from "@/lib/utils";

const LINES = [
  {
    delay: "0s",
    from: "lead" as const,
    who: "Maria · 11:52pm",
    body: "Hi — is 510 S Resh St still available? Saw it on Zillow.",
  },
  {
    delay: "1.25s",
    from: "agent" as const,
    who: "AI agent · 1.25s later",
    body: "Yes. 3 bed, 2 bath, $4,700/mo, September 1. Want a showing Tuesday in Anaheim?",
  },
  {
    delay: "2.35s",
    from: "lead" as const,
    who: "Maria",
    body: "Tuesday 10:30 works.",
  },
  {
    delay: "4.05s",
    from: "agent" as const,
    who: "Booked",
    body: "Booked Tuesday 10:30 at 510 S Resh St. Demo sync — not a live carrier.",
  },
];

export function LeadAgentDemo() {
  return (
    <DemoPlay className="space-y-2.5">
      {LINES.map((line) => (
        <div
          key={line.body}
          className={cn(
            "d d-thread max-w-[92%] rounded-btn border border-line px-3 py-2 text-[13px] font-medium leading-5",
            line.from === "agent" ? "ml-auto bg-rail" : "bg-mist",
          )}
          style={{ animationDelay: line.delay }}
        >
          <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-mute-2">
            {line.who}
          </p>
          <p className="mt-1 text-ink">{line.body}</p>
        </div>
      ))}
    </DemoPlay>
  );
}
