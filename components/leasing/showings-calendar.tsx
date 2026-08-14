"use client";

import Link from "next/link";
import { DeskPill, DeskToolbar } from "@/components/desk/packet-window";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { TUESDAY_ROUTE, type ShowingSlot } from "@/lib/leasing/ops";
import { useBookedShowings } from "@/lib/leasing/store";

function showingLabel(status: ShowingSlot["status"]): string {
  switch (status) {
    case "confirmed":
      return "Confirmed";
    case "no_show":
      return "No-show";
    case "available":
      return "Available";
    case "booked":
      return "Booked";
  }
}

function mergeRoute(booked: { listingId: string; slot: string; name: string }[]): ShowingSlot[] {
  return TUESDAY_ROUTE.map((slot) => {
    const hit = booked.find((row) => row.listingId === slot.listingId && row.slot.includes(slot.time));
    if (hit && slot.status === "available") {
      return { ...slot, status: "booked" as const, who: hit.name };
    }
    return slot;
  });
}

export function ShowingsCalendar() {
  const booked = useBookedShowings();
  const route = mergeRoute(booked);

  return (
    <Reveal>
      <DeskToolbar meta="Tuesday, Aug 18 · Anaheim route">
        <DeskPill active>Smart route</DeskPill>
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard/leads">Lead inbox</Link>
        </Button>
      </DeskToolbar>

      <div className="space-y-5 px-5 py-5 sm:px-6">
        <p className="text-[13px] font-medium leading-5 text-mute">
          Clustered Tuesday stops around 510 S Resh St. Self-book slots stay open until a renter
          claims them. Demo calendar — not a live lockbox.
        </p>

        <ol className="space-y-2">
          {route.map((slot) => (
            <li
              key={slot.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-line px-4 py-3"
            >
              <div>
                <p className="text-[14px] font-semibold tracking-[-0.2px] text-ink">
                  {slot.time} · {slot.address}
                </p>
                <p className="mt-0.5 text-[12px] font-medium text-mute">
                  {slot.who ?? "Open self-book slot"}
                </p>
              </div>
              <span className="desk-pill is-on">{showingLabel(slot.status)}</span>
            </li>
          ))}
        </ol>

        {booked.length > 0 ? (
          <div>
            <p className="text-[12px] font-medium uppercase tracking-[0.06em] text-mute-2">
              Tenant desk bookings
            </p>
            <ul className="mt-2 space-y-2">
              {booked.map((row) => (
                <li key={row.id} className="rounded-md border border-line px-4 py-3">
                  <p className="text-[13px] font-semibold text-ink">
                    {row.name} · {row.slot}
                  </p>
                  <p className="mt-0.5 text-[12px] font-medium text-mute">{row.email}</p>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </Reveal>
  );
}
