"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FEATURED_LISTING_ID } from "@/lib/data/mock-data";
import { TUESDAY_ROUTE } from "@/lib/leasing/ops";
import { bookShowing, useBookedShowings } from "@/lib/leasing/store";

const OPEN_SLOT = TUESDAY_ROUTE.find(
  (slot) => slot.listingId === FEATURED_LISTING_ID && slot.status === "available",
);

export function BookShowing({
  defaultName = "Jane Doe",
  defaultEmail = "jane.doe@leaseflow.dev",
}: {
  defaultName?: string;
  defaultEmail?: string;
}) {
  const booked = useBookedShowings();
  const already = booked.find((row) => row.listingId === FEATURED_LISTING_ID);
  const [name, setName] = useState(defaultName);
  const [email, setEmail] = useState(defaultEmail);

  const slotLabel = OPEN_SLOT
    ? `Tuesday, Aug 18 · ${OPEN_SLOT.time}`
    : "Tuesday, Aug 18 · 2:00 PM";

  if (already) {
    return (
      <div className="rounded-md border border-line bg-mist/40 p-4">
        <p className="text-[14px] font-semibold text-ink">Showing booked</p>
        <p className="mt-1 text-[13px] font-medium text-mute">
          {already.slot} at 510 S Resh St for {already.name}. Demo sync — not a live calendar hold.
        </p>
      </div>
    );
  }

  return (
    <form
      className="space-y-3 rounded-md border border-line p-4"
      onSubmit={(event) => {
        event.preventDefault();
        bookShowing({
          listingId: FEATURED_LISTING_ID,
          name: name.trim() || defaultName,
          email: email.trim() || defaultEmail,
          slot: slotLabel,
        });
      }}
    >
      <div>
        <p className="text-[14px] font-semibold text-ink">Book 510 S Resh St</p>
        <p className="mt-0.5 text-[13px] font-medium text-mute">
          Open self-book slot · {slotLabel}. Demo only.
        </p>
      </div>
      <label className="block">
        <span className="text-[12px] font-medium text-mute-2">Name</span>
        <input
          className="mt-1 w-full rounded-btn border border-line bg-paper px-3 py-2 text-[13px] text-ink"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </label>
      <label className="block">
        <span className="text-[12px] font-medium text-mute-2">Email</span>
        <input
          type="email"
          className="mt-1 w-full rounded-btn border border-line bg-paper px-3 py-2 text-[13px] text-ink"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </label>
      <Button type="submit" size="sm">
        Book showing
      </Button>
    </form>
  );
}
