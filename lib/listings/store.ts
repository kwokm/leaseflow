import {
  FEATURED_LISTING_ID,
  getAllProperties,
  mockProperties,
  type Property,
} from "@/lib/data/mock-data";

const STORED_LISTINGS_KEY = "leaseflow.listings.v1";

export function loadStoredListings(): Property[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORED_LISTINGS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Property[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveListing(listing: Property): Property {
  if (typeof window === "undefined") return listing;
  const seeded = mockProperties.some((row) => row.id === listing.id);
  const rest = loadStoredListings().filter((row) => row.id !== listing.id);
  window.localStorage.setItem(STORED_LISTINGS_KEY, JSON.stringify([listing, ...rest]));
  return seeded ? { ...listing } : listing;
}

export function listingThumb(listing: Property): string | undefined {
  return listing.photos?.[0];
}

export function featuredListingId(): string {
  return FEATURED_LISTING_ID;
}

export { getAllProperties };
