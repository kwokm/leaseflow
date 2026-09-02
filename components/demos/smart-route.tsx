'use client';

import { DemoPlay } from "@/components/demos/shell";

const STOPS = [
  { delay: "0.4s", label: "170 Chorus", note: "First stop" },
  { delay: "1.6s", label: "14 Modesto", note: "9:00" },
  { delay: "2.8s", label: "66 Diamond Flats", note: "12:00" },
  { delay: "4.0s", label: "Rise Park", note: "Nearby" },
] as const;

export function SmartRouteDemo() {
  return (
    <DemoPlay>
      <p className="text-[12px] font-medium text-mute">Smart route · Irvine</p>
      <svg className="mt-3 h-16 w-full" viewBox="0 0 320 64" fill="none" aria-hidden>
        <path
          className="d d-route"
          d="M16 48 C 70 48, 90 16, 140 16 S 200 48, 248 28 S 290 20, 304 20"
          stroke="#8d7bb8"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="1000"
          strokeDashoffset="1000"
        />
        {[16, 140, 248, 304].map((x) => (
          <circle key={x} cx={x} cy={x === 16 ? 48 : x === 140 ? 16 : x === 248 ? 28 : 20} r="3.5" fill="#8d7bb8" />
        ))}
      </svg>
      <ul className="mt-2 grid grid-cols-2 gap-2">
        {STOPS.map((stop) => (
          <li
            key={stop.label}
            className="d d-stop rounded-md border border-line px-3 py-2"
            style={{ animationDelay: stop.delay }}
          >
            <p className="text-[13px] font-semibold text-ink">{stop.label}</p>
            <p className="mt-0.5 text-[12px] font-medium text-mute">{stop.note}</p>
          </li>
        ))}
      </ul>
    </DemoPlay>
  );
}
