import { NextResponse } from "next/server";
import { getDeskLandlord } from "@/lib/auth/current-user";
import { privateBetaResponse } from "@/lib/auth/desk-response";
import { isDemoMode } from "@/lib/config/env";
import {
  ImportListingError,
  importListingFromUrl,
} from "@/lib/listings/import-listing";
import {
  importToProperty,
  isSeededZillow,
  parseZillowUrl,
  seededZillowImport,
} from "@/lib/listings/zillow";

export const runtime = "nodejs";

/**
 * Kept for the existing pull button. New UI calls /api/listings/import, which
 * accepts Zillow, Redfin, Realtor.com, and similar listing URLs.
 */
export async function POST(request: Request) {
  const desk = await getDeskLandlord();
  if (desk.status === "signed-out") {
    return NextResponse.json({ error: "Sign in to import a listing." }, { status: 401 });
  }
  if (desk.status === "not-invited") return privateBetaResponse();

  let body: { url?: unknown };
  try {
    body = (await request.json()) as { url?: unknown };
  } catch {
    return NextResponse.json({ error: "Send a JSON body with a listing URL." }, { status: 400 });
  }

  const url = typeof body.url === "string" ? body.url.trim() : "";
  if (!url) {
    return NextResponse.json({ error: "Paste a listing URL first." }, { status: 400 });
  }

  const parsed = parseZillowUrl(url);
  if (isDemoMode() && isSeededZillow(url, parsed?.zpid)) {
    return NextResponse.json({
      source: "seeded",
      note: "Loaded the sample 170 Chorus, Irvine listing, so address, rent, and photos are filled.",
      listing: importToProperty(seededZillowImport()),
    });
  }

  try {
    const preview = await importListingFromUrl(url);
    return NextResponse.json({
      source: "live",
      note: "Pulled from the public page — not a partnership. Edit anything that looks wrong before you save.",
      listing: importToProperty({
        source: "live",
        id: preview.zpid ? `zillow-${preview.zpid}` : `import-${Date.now()}`,
        zpid: preview.zpid,
        zillowUrl: preview.sourceUrl,
        address: preview.address ?? "",
        rent: preview.rent ?? 0,
        bedrooms: preview.bedrooms ?? 0,
        bathrooms: preview.bathrooms ?? 0,
        sqft: preview.sqft,
        photos: preview.photos,
        neighborhood: preview.neighborhood,
        propertyType: preview.propertyType,
        title: preview.address,
      }),
    });
  } catch (error) {
    if (error instanceof ImportListingError) {
      const status =
        error.code === "blocked" || error.code === "timeout" || error.code === "fetch_failed"
          ? 422
          : 400;
      return NextResponse.json({ error: error.message, code: error.code }, { status });
    }
    return NextResponse.json(
      { error: "Could not import that listing. Fill the form by hand." },
      { status: 422 }
    );
  }
}
