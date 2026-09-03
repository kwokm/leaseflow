/**
 * Import a public listing page into the fields we already store on `listings`.
 *
 * Portals do not offer a public write API. We read JSON-LD, Open Graph, and
 * listing meta that the page already serves, then stop. A bot wall or a URL
 * that is not a listing is a failed import — we never invent an address, rent,
 * or photos, and we never retry with stealth, cookies, or a headless browser.
 */

export type ListingPortal =
  | "zillow"
  | "redfin"
  | "realtor"
  | "apartments"
  | "trulia"
  | "compass"
  | "homes"
  | "hotpads"
  | "other";

export type ListingPreview = {
  sourceUrl: string;
  portal: ListingPortal;
  zpid?: string;
  address?: string;
  rent?: number;
  bedrooms?: number;
  bathrooms?: number;
  sqft?: number;
  neighborhood?: string;
  propertyType?: string;
  photos: string[];
};

export type ImportFailureCode =
  | "invalid_url"
  | "private_url"
  | "not_a_listing"
  | "blocked"
  | "fetch_failed"
  | "timeout";

export class ImportListingError extends Error {
  readonly code: ImportFailureCode;

  constructor(code: ImportFailureCode, message: string) {
    super(message);
    this.name = "ImportListingError";
    this.code = code;
  }
}

const LISTING_HOSTS: { portal: ListingPortal; host: string }[] = [
  { portal: "zillow", host: "zillow.com" },
  { portal: "redfin", host: "redfin.com" },
  { portal: "realtor", host: "realtor.com" },
  { portal: "apartments", host: "apartments.com" },
  { portal: "trulia", host: "trulia.com" },
  { portal: "compass", host: "compass.com" },
  { portal: "homes", host: "homes.com" },
  { portal: "hotpads", host: "hotpads.com" },
];

/** URL shapes we have verified against public listing pages. */
const LISTING_PATH: Record<ListingPortal, RegExp> = {
  zillow: /\/(homedetails|homes|apartments|b|community)\//i,
  redfin: /\/(home|apartment|rental)\/\d+/i,
  realtor: /\/(realestateandhomes-detail|rentals)\//i,
  apartments: /\/[a-z0-9-]+\/[a-z0-9-]+\//i,
  trulia: /\/[a-z]{2}\//i,
  compass: /\/(homedetails|listing)\//i,
  homes: /\/property\//i,
  hotpads: /\/[a-z0-9-]+/i,
  other: /./,
};

const BOT_WALL =
  /just a moment|attention required|access denied|enable javascript and cookies|cf-browser-verification|pardon our interruption|are you a (robot|human)|unusual traffic|captcha|one more step|verify you are human/i;

const PRIVATE_HOST =
  /^(localhost|127\.|10\.|0\.0\.0\.0|169\.254\.|::1|\[::1\])|(\.local|\.internal|\.localhost)$/i;

const PHOTO_HOST =
  /zillowstatic\.com|cdn-redfin\.com|rdcpix\.com|images\.apartments\.com|thumbs\.trulia|photos\.zillow|media\.redfin|sslx?\.cdn-redfin|images\.homes\.com|cloudfront\.net/i;

const SKIP_PHOTO =
  /logo|sprite|icon|avatar|pixel|tracking|favicon|mapbox|maps\.google|placeholder|1x1\./i;

const RESIDENCE_TYPE =
  /singlefamily|familyresidence|house|apartment|condo|townhouse|residence|accommodation|realestatelisting|living/i;

const USER_AGENT =
  "Mozilla/5.0 (compatible; LeaseproofListingImport/1.0; +https://leaseproof.app)";

const MAX_HTML_BYTES = 1_500_000;
const FETCH_MS = 8000;

export function portalForHost(hostname: string): ListingPortal {
  const host = hostname.replace(/^www\./i, "").toLowerCase();
  return LISTING_HOSTS.find((row) => host === row.host || host.endsWith(`.${row.host}`))?.portal ?? "other";
}

export function looksLikeListingPath(portal: ListingPortal, pathname: string): boolean {
  return LISTING_PATH[portal].test(pathname);
}

function isPrivateHostname(hostname: string): boolean {
  if (PRIVATE_HOST.test(hostname)) return true;
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname)) return true;
  if (/^192\.168\./.test(hostname)) return true;
  if (/^100\.(6[4-9]|[7-9]\d|1[0-2]\d)\./.test(hostname)) return true;
  return false;
}

export function parseListingUrl(raw: string): { url: string; portal: ListingPortal; zpid?: string } {
  const trimmed = raw.trim();
  if (!trimmed) {
    throw new ImportListingError("invalid_url", "Paste a public listing URL first.");
  }

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    throw new ImportListingError("invalid_url", "That does not look like a URL.");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new ImportListingError("invalid_url", "Use an https listing URL.");
  }
  if (url.username || url.password) {
    throw new ImportListingError("private_url", "That URL is not a public listing.");
  }
  if (isPrivateHostname(url.hostname)) {
    throw new ImportListingError("private_url", "That URL is not a public listing.");
  }

  const portal = portalForHost(url.hostname);
  if (portal === "other") {
    throw new ImportListingError(
      "not_a_listing",
      "Paste a Zillow, Redfin, Realtor.com, or similar listing URL."
    );
  }
  if (!looksLikeListingPath(portal, url.pathname)) {
    throw new ImportListingError(
      "not_a_listing",
      portal === "zillow"
        ? "Use a Zillow homedetails or homes URL for a single property."
        : portal === "redfin"
          ? "Use a Redfin /home/ listing URL, not a city search."
          : portal === "realtor"
            ? "Use a Realtor.com listing detail or rental URL, not a search."
            : "That URL does not look like a single listing."
    );
  }

  const zpid = trimmed.match(/\/(\d+)_zpid\/?/i)?.[1];
  return { url: url.toString(), portal, zpid };
}

function decode(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\\u0026/g, "&")
    .replace(/\\u002F/gi, "/");
}

function pickMeta(html: string, keys: string[]): string | undefined {
  for (const key of keys) {
    const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const prop = html.match(
      new RegExp(`<meta[^>]+(?:property|name)=["']${escaped}["'][^>]+content=["']([^"']+)["']`, "i")
    );
    const contentFirst = html.match(
      new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${escaped}["']`, "i")
    );
    const value = prop?.[1] ?? contentFirst?.[1];
    if (value) return decode(value);
  }
  return undefined;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function typesOf(node: Record<string, unknown>): string[] {
  const type = node["@type"];
  if (typeof type === "string") return [type];
  if (Array.isArray(type)) return type.filter((item): item is string => typeof item === "string");
  return [];
}

function walkJson(value: unknown, into: Record<string, unknown>[]): void {
  if (Array.isArray(value)) {
    for (const item of value) walkJson(item, into);
    return;
  }
  const node = asRecord(value);
  if (!node) return;
  into.push(node);
  if (node["@graph"]) walkJson(node["@graph"], into);
  for (const key of ["mainEntity", "about", "itemOffered", "offers", "item", "subjectOf"]) {
    if (key in node) walkJson(node[key], into);
  }
}

function extractJsonLd(html: string): Record<string, unknown>[] {
  const nodes: Record<string, unknown>[] = [];
  const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  for (const match of html.matchAll(re)) {
    const raw = match[1]?.trim();
    if (!raw) continue;
    try {
      walkJson(JSON.parse(decode(raw)), nodes);
    } catch {
      // Some portals wrap two objects back to back; ignore broken blocks.
    }
  }
  return nodes;
}

function numberFrom(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return undefined;
  const digits = value.replace(/[^\d.]/g, "");
  if (!digits) return undefined;
  const parsed = Number(digits);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function textFrom(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim()) return decode(value.trim());
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return undefined;
}

export function looksLikeAddress(value: string): boolean {
  const text = value.replace(/\s+/g, " ").trim();
  if (text.length < 8 || text.length > 160) return false;
  if (!/\d/.test(text) || !/[a-z]/i.test(text)) return false;
  if (BOT_WALL.test(text)) return false;
  if (/^(homes? for sale|real estate|zillow|redfin|realtor|apartments\.com)\b/i.test(text)) {
    return false;
  }
  return /\d+\s+\S+/.test(text) && /[a-z]{2,}/i.test(text);
}

function formatAddress(value: unknown): string | undefined {
  const asString = textFrom(value);
  if (asString && looksLikeAddress(asString.split("|")[0] ?? asString)) {
    return (asString.split("|")[0] ?? asString).trim();
  }

  const node = asRecord(value);
  if (!node) return undefined;

  const street = textFrom(node.streetAddress);
  const city = textFrom(node.addressLocality);
  const region = textFrom(node.addressRegion);
  const zip = textFrom(node.postalCode);
  if (!street) return undefined;

  const cityStateZip = [city, [region, zip].filter(Boolean).join(" ")].filter(Boolean).join(", ");
  const composed = [street, cityStateZip].filter(Boolean).join(", ");
  return looksLikeAddress(composed) ? composed : undefined;
}

function propertyTypeFrom(types: string[], fallback?: string): string | undefined {
  const hay = `${types.join(" ")} ${fallback ?? ""}`.toLowerCase();
  if (/apartment/.test(hay)) return "Apartment";
  if (/condo/.test(hay)) return "Condo";
  if (/town/.test(hay)) return "Townhouse";
  if (/singlefamily|house|residence/.test(hay)) return "House";
  return fallback;
}

function photoUrl(raw: string): string | undefined {
  let href = decode(raw).replace(/\\u002F/gi, "/").split(" ")[0]?.trim();
  if (!href) return undefined;
  if (href.startsWith("//")) href = `https:${href}`;
  try {
    const url = new URL(href);
    if (url.protocol !== "http:" && url.protocol !== "https:") return undefined;
    if (SKIP_PHOTO.test(url.href)) return undefined;
    const looksImage = /\.(jpe?g|png|webp)(\?|$)/i.test(url.pathname) || PHOTO_HOST.test(url.hostname);
    if (!looksImage) return undefined;
    return url.toString();
  } catch {
    return undefined;
  }
}

function collectImages(value: unknown, into: Set<string>): void {
  if (typeof value === "string") {
    const url = photoUrl(value);
    if (url) into.add(url);
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectImages(item, into);
    return;
  }
  const node = asRecord(value);
  if (!node) return;
  const href = textFrom(node.url) ?? textFrom(node.contentUrl) ?? textFrom(node.thumbnailUrl);
  if (href) collectImages(href, into);
}

function scoreNode(node: Record<string, unknown>): number {
  const types = typesOf(node).join(" ");
  let score = 0;
  if (RESIDENCE_TYPE.test(types)) score += 5;
  if (node.address || node.streetAddress) score += 3;
  if (node.numberOfBedrooms || node.numberOfBathroomsTotal || node.numberOfRooms) score += 2;
  if (node.offers || node.price) score += 1;
  if (node.floorSize) score += 1;
  return score;
}

function rentFrom(value: unknown, context: string): number | undefined {
  const amount = numberFrom(value);
  if (amount === undefined || amount <= 0) return undefined;
  const rental = /\/\s*mo|per month|monthly|for rent|rental/i.test(context);
  // Sale prices are not rent. Leave the field empty so the landlord types it.
  if (amount >= 50_000 && !rental) return undefined;
  if (amount < 100) return undefined;
  return Math.round(amount);
}

function floorSize(value: unknown): number | undefined {
  const amount = numberFrom(value);
  if (amount !== undefined) return Math.round(amount);
  const node = asRecord(value);
  if (!node) return undefined;
  const nested = numberFrom(node.value) ?? numberFrom(node.amount);
  return nested !== undefined ? Math.round(nested) : undefined;
}

function first<T>(...values: (T | undefined)[]): T | undefined {
  return values.find((value) => value !== undefined && value !== null && value !== "");
}

export function detectBotWall(html: string, status: number): boolean {
  if ([401, 403, 429, 503].includes(status)) return true;
  if (html.length < 400 && BOT_WALL.test(html)) return true;
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "";
  return BOT_WALL.test(title) || BOT_WALL.test(html.slice(0, 4000));
}

export function parseListingHtml(
  html: string,
  sourceUrl: string,
  portal: ListingPortal
): ListingPreview {
  const nodes = extractJsonLd(html).sort((a, b) => scoreNode(b) - scoreNode(a));
  const photos = new Set<string>();
  const description = pickMeta(html, ["og:description", "twitter:description", "description"]) ?? "";
  const title = pickMeta(html, ["og:title", "twitter:title"]);
  const ogImage = pickMeta(html, ["og:image", "og:image:url", "twitter:image"]);
  if (ogImage) collectImages(ogImage, photos);

  let address: string | undefined;
  let rent: number | undefined;
  let bedrooms: number | undefined;
  let bathrooms: number | undefined;
  let sqft: number | undefined;
  let neighborhood: string | undefined;
  let propertyType: string | undefined;

  for (const node of nodes) {
    const types = typesOf(node);
    address = first(address, formatAddress(node.address), formatAddress(node.streetAddress), formatAddress(node.name));
    const offer = asRecord(node.offers) ?? node;
    const offerContext = `${textFrom(asRecord(offer)?.description) ?? ""} ${description}`;
    rent = first(
      rent,
      rentFrom(offer.price, offerContext),
      rentFrom(node.price, `${textFrom(node.description) ?? ""} ${description}`)
    );
    bedrooms = first(
      bedrooms,
      numberFrom(node.numberOfBedrooms),
      numberFrom(node.numberOfRooms)
    );
    bathrooms = first(
      bathrooms,
      numberFrom(node.numberOfBathroomsTotal),
      numberFrom(node.numberOfBathrooms)
    );
    sqft = first(sqft, floorSize(node.floorSize), numberFrom(node.livingArea));
    const locality = asRecord(node.address);
    neighborhood = first(
      neighborhood,
      textFrom(node.neighborhood),
      textFrom(locality?.addressLocality)
    );
    propertyType = first(propertyType, propertyTypeFrom(types, textFrom(node.accommodationCategory)));
    collectImages(node.image, photos);
    collectImages(node.photo, photos);
    collectImages(node.photos, photos);
  }

  const titleAddress = title?.split("|")[0]?.trim();
  address = first(address, titleAddress && looksLikeAddress(titleAddress) ? titleAddress : undefined);

  rent = first(
    rent,
    rentFrom(pickMeta(html, ["product:price:amount", "og:price:amount"]), description),
    rentFrom(html.match(/"price"\s*:\s*"?\$?([\d,]+)/)?.[1], description),
    rentFrom(description.match(/\$([\d,]+)\s*(?:\/\s*mo|per month|\/month)?/i)?.[1], description)
  );
  bedrooms = first(
    bedrooms,
    numberFrom(html.match(/"numberOfBedrooms"\s*:\s*(\d+)/)?.[1]),
    numberFrom(description.match(/(\d+)\s*beds?/i)?.[1])
  );
  bathrooms = first(
    bathrooms,
    numberFrom(html.match(/"numberOfBathroomsTotal"\s*:\s*([\d.]+)/)?.[1]),
    numberFrom(description.match(/([\d.]+)\s*baths?/i)?.[1])
  );
  sqft = first(
    sqft,
    numberFrom(html.match(/"floorSize"[^}]+"value"\s*:\s*(\d+)/)?.[1]),
    numberFrom(description.match(/([\d,]+)\s*sq\.?\s*ft/i)?.[1])
  );
  address = first(address, formatAddress(html.match(/"streetAddress"\s*:\s*"([^"]+)"/)?.[1]));

  const cdn = html.match(/https?:\/\/[^"'\\\s]+/gi) ?? [];
  for (const match of cdn) {
    if (PHOTO_HOST.test(match) && /\.(jpe?g|png|webp)/i.test(match)) {
      const url = photoUrl(match.split("?")[0] ?? match);
      if (url) photos.add(url);
    }
  }

  const zpid = sourceUrl.match(/\/(\d+)_zpid/)?.[1];
  const preview: ListingPreview = {
    sourceUrl,
    portal,
    zpid,
    address,
    rent,
    bedrooms,
    bathrooms,
    sqft,
    neighborhood,
    propertyType,
    photos: [...photos].slice(0, 16),
  };

  if (!preview.address) {
    throw new ImportListingError(
      "not_a_listing",
      "That page is not a listing we can read — no address came back. Use the manual form."
    );
  }

  return preview;
}

export function importFailureMessage(error: ImportListingError): string {
  return error.message;
}

export async function fetchListingHtml(url: string): Promise<{ html: string; finalUrl: string }> {
  let response: Response;
  try {
    response = await fetch(url, {
      headers: {
        "user-agent": USER_AGENT,
        accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8",
        "accept-language": "en-US,en;q=0.8",
      },
      redirect: "follow",
      cache: "no-store",
      signal: AbortSignal.timeout(FETCH_MS),
    });
  } catch (error) {
    if (error instanceof Error && error.name === "TimeoutError") {
      throw new ImportListingError(
        "timeout",
        "The listing page did not answer in time. Try again, or fill the form by hand."
      );
    }
    throw new ImportListingError(
      "fetch_failed",
      "Could not reach that listing page. Check the URL, or fill the form by hand."
    );
  }

  const finalUrl = response.url || url;
  try {
    parseListingUrl(finalUrl);
  } catch (error) {
    if (error instanceof ImportListingError) throw error;
  }

  const length = Number(response.headers.get("content-length") ?? 0);
  if (length > MAX_HTML_BYTES) {
    throw new ImportListingError("fetch_failed", "That page is too large to import.");
  }

  const html = (await response.text()).slice(0, MAX_HTML_BYTES);

  if (detectBotWall(html, response.status) || !response.ok) {
    throw new ImportListingError(
      "blocked",
      "The listing site blocked the import. Nothing was invented — fill the address, rent, and photos by hand."
    );
  }

  const type = response.headers.get("content-type") ?? "";
  if (type && !/html|json|text\/plain/i.test(type)) {
    throw new ImportListingError("not_a_listing", "That URL is not a listing page.");
  }

  return { html, finalUrl };
}

export async function importListingFromUrl(raw: string): Promise<ListingPreview> {
  const parsed = parseListingUrl(raw);
  const { html, finalUrl } = await fetchListingHtml(parsed.url);
  const preview = parseListingHtml(html, finalUrl, parsed.portal);
  return {
    ...preview,
    zpid: preview.zpid ?? parsed.zpid,
    sourceUrl: parsed.url,
  };
}
