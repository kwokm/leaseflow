import { NextResponse } from "next/server";
import { getViewer } from "@/lib/auth/current-user";
import { isDemoMode } from "@/lib/config/env";
import {
  ImportListingError,
  importListingFromUrl,
  type ListingPreview,
} from "@/lib/listings/import-listing";
import { importToProperty, isSeededZillow, seededZillowImport } from "@/lib/listings/zillow";

export const runtime = "nodejs";

function seededPreview(): ListingPreview {
  const seeded = seededZillowImport();
  return {
    sourceUrl: seeded.zillowUrl,
    portal: "zillow",
    zpid: seeded.zpid,
    address: seeded.address,
    rent: seeded.rent,
    bedrooms: seeded.bedrooms,
    bathrooms: seeded.bathrooms,
    sqft: seeded.sqft,
    neighborhood: seeded.neighborhood,
    propertyType: seeded.propertyType,
    photos: seeded.photos,
  };
}

/**
 * Preview only. The landlord confirms on the form, then POST /api/listings
 * creates the Neon row owned by their Clerk session.
 */
export async function POST(request: Request) {
  const viewer = await getViewer("landlord");
  if (!isDemoMode() && !viewer) {
    return NextResponse.json({ error: "Sign in to import a listing." }, { status: 401 });
  }

  let body: { url?: unknown };
  try {
    body = (await request.json()) as { url?: unknown };
  } catch {
    return NextResponse.json({ error: "Send a JSON body with a listing URL." }, { status: 400 });
  }

  const url = typeof body.url === "string" ? body.url.trim() : "";
  if (!url) {
    return NextResponse.json({ error: "Paste a public listing URL first." }, { status: 400 });
  }

  // Demo-only shortcut for the sample Irvine home. Production always reads the
  // public page and fails clearly if the portal blocks the fetch.
  if (isDemoMode() && isSeededZillow(url)) {
    return NextResponse.json({
      source: "seeded",
      note: "Loaded the sample 170 Chorus, Irvine listing so you can preview the import.",
      preview: seededPreview(),
      listing: importToProperty(seededZillowImport()),
    });
  }

  try {
    const preview = await importListingFromUrl(url);
    return NextResponse.json({
      source: "live",
      note: `Pulled from the public ${preview.portal} page — not a partnership. Edit anything that looks wrong before you save.`,
      preview,
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
