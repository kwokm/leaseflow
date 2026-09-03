import { FEATURED_LISTING_ID } from "@/lib/data/mock-data";

/**
 * Marketing "Apply as renter" must never 404.
 *
 * Demo catalogues include 170 Chorus as `resh-510`. Production does not seed
 * that home, so the CTA goes to `/apply` — a dedicated "ask your landlord"
 * page — instead of a missing listing id.
 */
export function applyAsRenterHref(demo: boolean): string {
  return demo ? `/apply/${FEATURED_LISTING_ID}` : "/apply";
}

export function featuredApplyHref(): string {
  return `/apply/${FEATURED_LISTING_ID}`;
}
