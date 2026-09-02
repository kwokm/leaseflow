'use client';

import { DemoPlay } from "@/components/demos/shell";
import { cn } from "@/lib/utils";

const LINES = [
  {
    delay: "0.15s",
    from: "lead" as const,
    body: "Maria · Facebook — Is 170 Chorus still available? What’s the move-in?",
  },
  {
    delay: "1.25s",
    from: "agent" as const,
    body: "Yes. Irvine, September 1, $6,500/mo. Want a showing Tuesday or Thursday?",
  },
  {
    delay: "2.35s",
    from: "lead" as const,
    body: "Tuesday 10:30. See you on Chorus.",
  },
];

export function FacebookDemo() {
  return (
    <DemoPlay>
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-[13px] font-semibold text-ink">Marketplace</p>
        <span className="flex items-center gap-1.5 text-[12px] font-medium text-mute">
          <span className="d d-dot-fb inline-block h-1.5 w-1.5 rounded-full bg-ok" />
          Active now
        </span>
      </div>
      <div className="space-y-2">
        {LINES.map((line) => (
          <div
            key={line.body}
            className={cn(
              "d d-fb max-w-[92%] rounded-btn border border-line px-3 py-2 text-[13px] font-medium leading-5",
              line.from === "agent" ? "ml-auto bg-rail" : "bg-mist",
            )}
            style={{ animationDelay: line.delay }}
          >
            {line.body}
          </div>
        ))}
      </div>
    </DemoPlay>
  );
}
