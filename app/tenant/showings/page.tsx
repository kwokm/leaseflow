"use client";

import { DeskToolbar } from "@/components/desk/packet-window";
import { BookShowing } from "@/components/leasing/book-showing";
import { Reveal } from "@/components/motion/reveal";
import { TUESDAY_ROUTE } from "@/lib/leasing/ops";
import { FEATURED_LISTING_ID } from "@/lib/data/mock-data";

export default function TenantShowingsPage() {
  const slots = TUESDAY_ROUTE.filter((slot) => slot.listingId === FEATURED_LISTING_ID);

  return (
    <Reveal>
      <DeskToolbar meta="510 S Resh St · Tuesday Anaheim">
        <span className="desk-pill is-on">Self-book</span>
      </DeskToolbar>
      <div className="space-y-5 px-5 py-5 sm:px-6">
        <p className="text-[13px] font-medium leading-5 text-mute">
          Pick the open Tuesday slot. Confirmation stays in this browser — demo sync, not a live
          lockbox.
        </p>
        <ul className="space-y-2">
          {slots.map((slot) => (
            <li
              key={slot.id}
              className="flex items-center justify-between gap-3 rounded-md border border-line px-4 py-3"
            >
              <div>
                <p className="text-[14px] font-semibold text-ink">{slot.time}</p>
                <p className="text-[12px] font-medium text-mute">{slot.address}</p>
              </div>
              <span className="desk-pill">
                {slot.status === "available" ? "Available" : "Held"}
              </span>
            </li>
          ))}
        </ul>
        <BookShowing />
      </div>
    </Reveal>
  );
}
