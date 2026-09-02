import "server-only";

import { and, desc, eq, isNull } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { listings, type ListingRow } from "@/lib/db/schema";
import { isDemoMode } from "@/lib/config/env";
import { demoProperties, demoPropertyById, type Property } from "@/lib/data/mock-data";
import { newId } from "@/lib/ids";

/**
 * Listings come from Neon. The seeded Irvine homes are added only when
 * LEASEPROOF_DEMO=1 — otherwise a brand new landlord correctly sees an empty
 * pipeline and the "create your first listing" state.
 */

export function toProperty(row: ListingRow): Property {
  return {
    id: row.id,
    address: row.address,
    rent: row.rent,
    bedrooms: Number(row.bedrooms),
    bathrooms: Number(row.bathrooms),
    availableDate: row.availableDate ?? "",
    screeningPackage: "standard",
    applyUrl: `/apply/${row.id}`,
    createdAt: row.createdAt.toISOString(),
    photos: row.photos ?? [],
    sqft: row.sqft ?? undefined,
    zillowUrl: row.zillowUrl ?? undefined,
    zpid: row.zpid ?? undefined,
    neighborhood: row.neighborhood ?? undefined,
    propertyType: row.propertyType ?? undefined,
  };
}

/** Demo seeds first so the featured listing keeps its place in the pipeline. */
function withDemoSeeds(rows: Property[]): Property[] {
  if (!isDemoMode()) return rows;
  const seen = new Set(rows.map((row) => row.id));
  return [...demoProperties().filter((row) => !seen.has(row.id)), ...rows];
}

/**
 * A landlord's own listings. `ownerId` is required so the query can never be
 * widened to every tenant's listings by an unauthenticated caller.
 */
export async function listProperties(ownerId: string): Promise<Property[]> {
  const database = getDb();
  if (!database) return withDemoSeeds([]);

  const rows = await database
    .select()
    .from(listings)
    .where(and(eq(listings.ownerId, ownerId), isNull(listings.archivedAt)))
    .orderBy(desc(listings.createdAt));

  return withDemoSeeds(rows.map(toProperty));
}

/** Demo catalogue only — used when there is no session to scope a query by. */
export function demoOnlyProperties(): Property[] {
  return withDemoSeeds([]);
}

export async function getProperty(id: string): Promise<Property | undefined> {
  const database = getDb();
  if (database) {
    const [row] = await database.select().from(listings).where(eq(listings.id, id)).limit(1);
    if (row) return toProperty(row);
  }
  return isDemoMode() ? demoPropertyById(id) : undefined;
}

/**
 * "We looked and it is not there" and "we could not look" are different answers
 * and the renter deserves different pages for them. An unknown id is a 404; a
 * database that will not answer is not.
 */
export type PropertyLookup =
  | { status: "found"; property: Property }
  | { status: "missing" }
  | { status: "unavailable" };

export async function findProperty(id: string): Promise<PropertyLookup> {
  try {
    const property = await getProperty(id);
    return property ? { status: "found", property } : { status: "missing" };
  } catch (error) {
    console.error(`[listings] Could not read listing ${id}.`, error);
    return { status: "unavailable" };
  }
}

/** Listings for a desk that must render whether or not Neon answers. */
export async function listPropertiesSafely(
  ownerId: string | null
): Promise<{ properties: Property[]; unavailable: boolean }> {
  try {
    const properties = ownerId ? await listProperties(ownerId) : demoOnlyProperties();
    return { properties, unavailable: false };
  } catch (error) {
    console.error("[listings] Could not read the pipeline.", error);
    return { properties: [], unavailable: true };
  }
}

export type ListingInput = {
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
};

export async function createListing(
  input: ListingInput,
  ownerId: string | null
): Promise<Property> {
  const database = getDb();
  if (!database) throw new Error("DATABASE_URL is not set");

  const [row] = await database
    .insert(listings)
    .values({
      id: newId("lst"),
      ownerId,
      address: input.address,
      rent: Math.max(0, Math.round(input.rent)),
      bedrooms: String(input.bedrooms ?? 0),
      bathrooms: String(input.bathrooms ?? 0),
      sqft: input.sqft ?? null,
      availableDate: input.availableDate ?? null,
      photos: input.photos ?? [],
      neighborhood: input.neighborhood ?? null,
      propertyType: input.propertyType ?? null,
      zillowUrl: input.zillowUrl ?? null,
      zpid: input.zpid ?? null,
    })
    .returning();

  return toProperty(row);
}
