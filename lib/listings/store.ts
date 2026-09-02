import { FEATURED_LISTING_ID, type Property } from "@/lib/data/mock-data";

export function listingThumb(listing: Property): string | undefined {
  return listing.photos?.[0];
}

export function featuredListingId(): string {
  return FEATURED_LISTING_ID;
}

/** Persist a new listing to Neon. Throws with the server's message on failure. */
export async function createListing(input: {
  address: string;
  rent: number;
  bedrooms: number;
  bathrooms: number;
  sqft?: number;
  availableDate?: string;
  photos?: string[];
  neighborhood?: string;
  propertyType?: string;
  zillowUrl?: string;
  zpid?: string;
}): Promise<Property> {
  const response = await fetch("/api/listings", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });

  const payload = (await response.json().catch(() => ({}))) as {
    listing?: Property;
    error?: string;
  };

  if (!response.ok || !payload.listing) {
    throw new Error(payload.error ?? "Could not save that listing.");
  }

  return payload.listing;
}
