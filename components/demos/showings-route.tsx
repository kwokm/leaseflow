"use client";

import { DemoPlay } from "@/components/demos/shell";

const SLOTS = [
  { time: "9:00", place: "Broadway", status: "No-show", confirmed: false },
  { time: "10:30", place: "Resh St", status: "Confirmed", confirmed: true },
  { time: "12:00", place: "Anaheim Blvd", status: "Confirmed", confirmed: true },
  { time: "2:00", place: "Resh St", status: "Available", confirmed: false, live: true },
] as const;

export function ShowingsAgendaDemo() {
  return (
    <DemoPlay>
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-[12px] font-medium text-mute">Tuesday · Anaheim</p>
        <span className="relative desk-pill is-on">
          <span className="d d-glow pointer-events-none absolute inset-0 rounded-[inherit] border border-[#c4b8dc]" />
          Live availability
        </span>
      </div>
      <ul className="space-y-2">
        {SLOTS.map((slot, index) => (
          <li
            key={slot.time}
            className="d d-enter relative overflow-hidden rounded-md border border-line px-3 py-2"
            style={{ animationDelay: `${index * 160}ms` }}
          >
            <div className={slot.confirmed ? "d d-nudge flex items-center justify-between gap-3" : "flex items-center justify-between gap-3"}>
              <p className="text-[13px] font-semibold text-ink">
                {slot.time} · {slot.place}
              </p>
              <span className={`desk-pill ${slot.confirmed || slot.live ? "is-on" : ""}`}>
                {slot.status}
              </span>
            </div>
            {slot.confirmed ? (
              <span className="d d-flash pointer-events-none absolute inset-0 rounded-[inherit] border border-[#c4b8dc]" />
            ) : null}
          </li>
        ))}
      </ul>
    </DemoPlay>
  );
}

export function ShowingsRouteDemo() {
  return <ShowingsAgendaDemo />;
}
