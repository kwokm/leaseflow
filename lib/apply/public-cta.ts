/**
 * Marketing "Apply as renter" must never 404.
 *
 * The demo catalogue's featured home is 170 Chorus (`resh-510` in
 * lib/data/mock-data.ts). Production does not seed that home, so the CTA goes
 * to `/apply` — a dedicated "ask your landlord" page — instead of a missing id.
 *
 * Kept free of mock-data so unit tests can import it from node:test.
 */
export const FEATURED_APPLY_LISTING_ID = "resh-510";

export function applyAsRenterHref(demo: boolean): string {
  return demo ? `/apply/${FEATURED_APPLY_LISTING_ID}` : "/apply";
}

export function featuredApplyHref(): string {
  return `/apply/${FEATURED_APPLY_LISTING_ID}`;
}
