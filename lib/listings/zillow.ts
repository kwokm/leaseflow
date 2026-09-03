import {
  FEATURED_LISTING_ID,
  FEATURED_PHOTOS,
  demoPropertyById,
  type Property,
  type ScreeningPackage,
} from "@/lib/data/mock-data";

/** Legacy Anaheim zpid — old 510 S Resh pastes still seed the featured listing. */
export const SEEDED_ZPID = "25128456";
export const SEEDED_ZILLOW_URL =
  "https://www.zillow.com/homes/170-Chorus,-Irvine,-CA-92618_rb/";
export const LEGACY_SEEDED_ZILLOW_URL =
  "https://www.zillow.com/homedetails/510-S-Resh-St-Anaheim-CA-92805/25128456_zpid/";
export const SEEDED_COMPASS_URL =
  "https://www.compass.com/homedetails/170-Chorus-Irvine-CA-92618/2162455193399296537_lid/";
export const SEEDED_MLS = "PW26166675";

export type ZillowImport = {
  source: "seed" | "live";
  id: string;
  zpid?: string;
  zillowUrl: string;
  address: string;
  rent: number;
  bedrooms: number;
  bathrooms: number;
  sqft?: number;
  photos: string[];
  neighborhood?: string;
  propertyType?: string;
  title?: string;
};

const HOMEDETAILS = /^https?:\/\/(www\.)?zillow\.com\/homedetails\//i;

export function parseZillowUrl(raw: string): { url: string; zpid?: string } | null {
  const trimmed = raw.trim();
  if (!HOMEDETAILS.test(trimmed)) return null;
  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return null;
  }
  if (!url.hostname.endsWith("zillow.com")) return null;
  const zpid = trimmed.match(/\/(\d+)_zpid\/?/i)?.[1];
  return { url: url.toString(), zpid };
}

export function isSeededZillow(url: string, zpid?: string): boolean {
  const hay = url.toLowerCase();
  return (
    zpid === SEEDED_ZPID ||
    url.includes(`${SEEDED_ZPID}_zpid`) ||
    hay.includes("510-s-resh") ||
    hay.includes("510 s resh") ||
    hay.includes("170-chorus") ||
    hay.includes("170 chorus") ||
    hay.includes("pw26166675") ||
    hay.includes("2162455193399296537") ||
    hay.includes("compass.com/homedetails/170-chorus")
  );
}

export function seededZillowImport(): ZillowImport {
  const featured = demoPropertyById(FEATURED_LISTING_ID);
  return {
    source: "seed",
    id: FEATURED_LISTING_ID,
    zillowUrl: featured?.zillowUrl ?? SEEDED_ZILLOW_URL,
    address: featured?.address ?? "170 Chorus, Irvine, CA 92618",
    rent: featured?.rent ?? 6500,
    bedrooms: featured?.bedrooms ?? 4,
    bathrooms: featured?.bathrooms ?? 3.5,
    sqft: featured?.sqft ?? 3010,
    photos: [...FEATURED_PHOTOS],
    neighborhood: featured?.neighborhood ?? "Rise Park",
    propertyType: featured?.propertyType ?? "House",
    title: featured?.address ?? "170 Chorus, Irvine, CA 92618",
  };
}

export function importToProperty(
  pulled: ZillowImport,
  pkg: ScreeningPackage = "standard"
): Property {
  return {
    id: pulled.id,
    address: pulled.address,
    rent: pulled.rent,
    bedrooms: pulled.bedrooms,
    bathrooms: pulled.bathrooms,
    availableDate: "2026-09-01",
    screeningPackage: pkg,
    applyUrl: `/apply/${pulled.id}`,
    createdAt: new Date().toISOString(),
    photos: pulled.photos,
    sqft: pulled.sqft,
    zillowUrl: pulled.zillowUrl,
    zpid: pulled.zpid,
    neighborhood: pulled.neighborhood,
    propertyType: pulled.propertyType,
  };
}
