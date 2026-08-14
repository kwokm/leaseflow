"use client";

import { DemoLine, DemoShell } from "@/components/demos/shell";
import { resetting, storyOn, useDemoLoop } from "@/lib/demos/loop";
import { cn } from "@/lib/utils";

const LINES = [
  {
    at: 0.08,
    from: "lead" as const,
    who: "Maria · 11:52pm",
    body: "Hi — is 510 S Resh St still available? Saw it on Zillow.",
  },
  {
    at: 0.22,
    from: "agent" as const,
    who: "AI agent · 1s later",
    body: "Yes. 3 bed, 2 bath, $4,700/mo, September 1. Want a showing Tuesday in Anaheim?",
  },
  {
    at: 0.48,
    from: "lead" as const,
    who: "Maria · 11:52pm",
    body: "Tuesday 10:30 works.",
  },
  {
    at: 0.64,
    from: "agent" as const,
    who: "Booked",
    body: "Booked Tuesday 10:30 at 510 S Resh St. Demo sync — not a live carrier.",
  },
];

export function LeadAgentDemo() {
  const { ref, phase } = useDemoLoop(11000);
  const reset = resetting(phase);

  return (
    <div ref={ref}>
      <DemoShell reset={reset} className="space-y-2.5">
        {LINES.map((line) => (
          <DemoLine
            key={line.body}
            on={storyOn(phase, line.at)}
            className={cn(
              "max-w-[92%] rounded-btn border border-line px-3 py-2 text-[13px] font-medium leading-5",
              line.from === "agent" ? "ml-auto bg-rail" : "bg-mist",
            )}
          >
            <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-mute-2">
              {line.who}
            </p>
            <p className="mt-1 text-ink">{line.body}</p>
          </DemoLine>
        ))}
      </DemoShell>
    </div>
  );
}
