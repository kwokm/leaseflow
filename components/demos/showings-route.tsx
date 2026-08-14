"use client";

import { DemoShell } from "@/components/demos/shell";
import { resetting, storyOn, useDemoLoop } from "@/lib/demos/loop";

const STOPS = [
  { id: "resh", label: "510 S Resh St", at: 0.16 },
  { id: "broadway", label: "318 W Broadway", at: 0.3 },
  { id: "blvd", label: "201 S Anaheim Blvd", at: 0.44 },
  { id: "colony", label: "The Colony", at: 0.58 },
] as const;

const SLOTS = [
  { time: "9:00", place: "Broadway", start: "Available", end: "No-show", at: 0.2 },
  { time: "10:30", place: "Resh St", start: "Available", end: "Confirmed", at: 0.36 },
  { time: "12:00", place: "Anaheim Blvd", start: "Available", end: "Confirmed", at: 0.52 },
  { time: "2:00", place: "Resh St", start: "Available", end: "Confirmed", at: 0.68 },
] as const;

export function ShowingsRouteDemo() {
  const { ref, phase } = useDemoLoop(13000);
  const reset = resetting(phase);

  return (
    <div ref={ref}>
      <DemoShell reset={reset}>
        <p className="text-[12px] font-medium text-mute">Tuesday · Anaheim route</p>
        <ol className="mt-3 flex flex-wrap items-center gap-1.5">
          {STOPS.map((stop, index) => {
            const on = storyOn(phase, stop.at);
            return (
              <li key={stop.id} className="flex items-center gap-1.5">
                {index > 0 ? (
                  <span className={`demo-row ${on ? "is-on" : ""} text-mute-2`} aria-hidden>
                    →
                  </span>
                ) : null}
                <span className={`desk-pill ${on ? "is-on" : ""}`}>{stop.label}</span>
              </li>
            );
          })}
        </ol>
        <ul className="mt-4 space-y-2">
          {SLOTS.map((slot) => {
            const filled = storyOn(phase, slot.at);
            return (
              <li
                key={slot.time}
                className="flex items-center justify-between gap-3 rounded-md border border-line px-3 py-2"
              >
                <p className="text-[13px] font-semibold text-ink">
                  {slot.time} · {slot.place}
                </p>
                <span className={`desk-pill ${filled ? "is-on" : ""}`}>
                  {filled ? slot.end : slot.start}
                </span>
              </li>
            );
          })}
        </ul>
      </DemoShell>
    </div>
  );
}
