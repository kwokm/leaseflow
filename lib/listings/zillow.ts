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

function decode(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function pickMeta(html: string, keys: string[]): string | undefined {
  for (const key of keys) {
    const prop = html.match(
      new RegExp(`<meta[^>]+(?:property|name)=["']${key}["'][^>]+content=["']([^"']+)["']`, "i")
    );
    const contentFirst = html.match(
      new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${key}["']`, "i")
    );
    const value = prop?.[1] ?? contentFirst?.[1];
    if (value) return decode(value);
  }
  return undefined;
}

function collectPhotos(html: string): string[] {
  const found = new Set<string>();
  const og = pickMeta(html, ["og:image", "og:image:url"]);
  if (og) found.add(og);
  const re = /https?:\/\/[^"'\\\s]+zillowstatic\.com\/[^"'\\\s]+/gi;
  for (const match of html.match(re) ?? []) {
    if (/\.(jpg|jpeg|png|webp)/i.test(match)) found.add(match.split("?")[0]);
  }
  return [...found].slice(0, 12);
}

function numberFrom(text: string | undefined): number | undefined {
  if (!text) return undefined;
  const digits = text.replace(/[^\d.]/g, "");
  if (!digits) return undefined;
  return Number(digits);
}

export async function fetchLiveZillow(url: string): Promise<ZillowImport | null> {
  try {
    const response = await fetch(url, {
      headers: {
        "user-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
        accept: "text/html,application/xhtml+xml",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(6000),
    });
    if (!response.ok) return null;
    const html = await response.text();
    const title = pickMeta(html, ["og:title", "twitter:title"]) ?? undefined;
    const description = pickMeta(html, ["og:description", "description"]) ?? "";
    const photos = collectPhotos(html);
    const address =
      title?.split("|")[0]?.trim() ||
      html.match(/"streetAddress"\s*:\s*"([^"]+)"/)?.[1];
    const rent =
      numberFrom(html.match(/"price"\s*:\s*"?\$?([\d,]+)/)?.[1]) ??
      numberFrom(description.match(/\$([\d,]+)/)?.[1]);
    const bedrooms =
      numberFrom(html.match(/"numberOfBedrooms"\s*:\s*(\d+)/)?.[1]) ??
      numberFrom(description.match(/(\d+)\s*bed/i)?.[1]);
    const bathrooms =
      numberFrom(html.match(/"numberOfBathroomsTotal"\s*:\s*([\d.]+)/)?.[1]) ??
      numberFrom(description.match(/([\d.]+)\s*bath/i)?.[1]);
    const sqft = numberFrom(
      html.match(/"floorSize"[^}]+"value"\s*:\s*(\d+)/)?.[1] ??
        description.match(/([\d,]+)\s*sqft/i)?.[1]
    );

    if (!address && photos.length === 0) return null;

    const zpid = url.match(/\/(\d+)_zpid/)?.[1];
    return {
      source: "live",
      id: zpid ? `zillow-${zpid}` : `zillow-${Date.now()}`,
      zpid,
      zillowUrl: url,
      address: address || "Zillow listing",
      rent: rent ?? 0,
      bedrooms: bedrooms ?? 0,
      bathrooms: bathrooms ?? 0,
      sqft,
      photos,
      title,
    };
  } catch {
    return null;
  }
}
