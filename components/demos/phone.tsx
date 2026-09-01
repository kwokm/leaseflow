"use client";

import { DemoPlay } from "@/components/demos/shell";
import { cn } from "@/lib/utils";

const LINES = [
  {
    delay: "0s",
    from: "caller" as const,
    body: "Hi, I saw your listing on Zillow — is 510 S Resh St still available?",
  },
  {
    delay: "1.35s",
    from: "agent" as const,
    body: "Yes. It’s a 3-bed, 2-bath house at $4,700 a month, available September 1. Want to book a showing?",
  },
  {
    delay: "2.7s",
    from: "caller" as const,
    body: "Tuesday at 2pm works.",
  },
  {
    delay: "4.05s",
    from: "agent" as const,
    body: "Booked Tuesday at 2:00 at 510 S Resh St. You’ll get a confirmation text. Demo transcript — not a live dialer.",
  },
];

export function PhoneDemo() {
  return (
    <DemoPlay className="space-y-2.5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="d d-dot-call inline-block h-2 w-2 rounded-full bg-ok" />
          <p className="text-[13px] font-semibold text-ink">AI Agent — live call</p>
        </div>
        <div className="flex h-5 items-end gap-0.5">
          {[0, 0.1, 0.2, 0.3, 0.4].map((delay) => (
            <span
              key={delay}
              className="d d-eq w-1 rounded-sm bg-ink-2"
              style={{ height: 14, animationDelay: `${delay}s` }}
            />
          ))}
        </div>
      </div>
      {LINES.map((line) => (
        <div
          key={line.body}
          className={cn(
            "d d-thread rounded-btn border border-line px-3 py-2 text-[13px] font-medium leading-5",
            line.from === "agent" ? "ml-6 bg-rail" : "mr-6 bg-mist",
          )}
          style={{ animationDelay: line.delay }}
        >
          <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-mute-2">
            {line.from === "agent" ? "Leaseproof agent" : "Caller"}
          </p>
          <p className="mt-1 text-ink">{line.body}</p>
        </div>
      ))}
    </DemoPlay>
  );
}
