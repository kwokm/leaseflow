"use client";

import { DemoLine, DemoShell } from "@/components/demos/shell";
import { PHONE_TRANSCRIPT } from "@/lib/leasing/ops";
import { resetting, storyOn, useDemoLoop } from "@/lib/demos/loop";
import { cn } from "@/lib/utils";

const ATS = [0.1, 0.28, 0.48, 0.66];

export function PhoneDemo() {
  const { ref, phase } = useDemoLoop(14000);
  const reset = resetting(phase);

  return (
    <div ref={ref}>
      <DemoShell reset={reset} className="space-y-2.5">
        <p className="text-[12px] font-medium text-mute">Demo transcript · not a live dialer</p>
        {PHONE_TRANSCRIPT.map((line, index) => (
          <DemoLine
            key={`${line.from}-${index}`}
            on={storyOn(phase, ATS[index] ?? 0.7)}
            className={cn(
              "rounded-btn border border-line px-3 py-2 text-[13px] font-medium leading-5",
              line.from === "agent" ? "ml-6 bg-rail" : "mr-6 bg-mist",
            )}
          >
            <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-mute-2">
              {line.from === "agent" ? "Leaseproof agent" : "Caller"}
            </p>
            <p className="mt-1 text-ink">{line.body}</p>
          </DemoLine>
        ))}
      </DemoShell>
    </div>
  );
}
