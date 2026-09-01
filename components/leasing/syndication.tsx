import { MARKETPLACES, listingSyndication } from "@/lib/leasing/ops";
import { FEATURED_LISTING_ID } from "@/lib/data/mock-data";

export function SyndicationTiles({ listingId }: { listingId: string }) {
  const live = listingSyndication(listingId) === "live";

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-[14px] font-semibold tracking-[-0.2px] text-ink">Listing syndication</p>
          <p className="mt-0.5 text-[12px] font-medium text-mute">
            One listing, several boards. Demo sync — no live marketplace API.
          </p>
        </div>
        <span className="desk-pill is-on">{live ? "Anaheim seeded live" : "Pending"}</span>
      </div>
      <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {MARKETPLACES.map((board) => {
          const status = live && listingId === FEATURED_LISTING_ID ? board.status : "pending";
          return (
            <li
              key={board.id}
              className="rounded-md border border-line bg-paper px-3 py-3"
            >
              <p className="text-[13px] font-semibold text-ink">{board.name}</p>
              <p className="mt-1 text-[12px] font-medium capitalize text-mute">{status}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
