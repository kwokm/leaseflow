import { NextResponse } from "next/server";
import { getViewer } from "@/lib/auth/current-user";
import { databaseEnabled, isDemoMode } from "@/lib/config/env";
import {
  createListing,
  demoOnlyProperties,
  listProperties,
  type ListingInput,
} from "@/lib/listings/service";

export const dynamic = "force-dynamic";

/**
 * Landlords see their own listings, and only their own. Without a session there
 * is nothing to scope by, so the response is the demo catalogue (empty unless
 * LEASEPROOF_DEMO=1) rather than every landlord's listings.
 */
export async function GET() {
  const viewer = await getViewer("landlord");
  const properties = viewer?.user
    ? await listProperties(viewer.user.id)
    : demoOnlyProperties();
  return NextResponse.json({ listings: properties, demo: isDemoMode() });
}

function toNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export async function POST(request: Request) {
  if (!databaseEnabled()) {
    return NextResponse.json(
      { error: "Listings need a database. Set DATABASE_URL to save one." },
      { status: 503 }
    );
  }

  // Require the mirrored user row, not just a Clerk session: a listing with no
  // owner would be invisible to every desk, including its creator's.
  const viewer = await getViewer("landlord");
  if (!viewer?.user) {
    return NextResponse.json({ error: "Sign in to create a listing." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as Partial<ListingInput> | null;
  const address = typeof body?.address === "string" ? body.address.trim() : "";
  if (!address) {
    return NextResponse.json({ error: "An address is required." }, { status: 400 });
  }

  const listing = await createListing(
    {
      address,
      rent: toNumber(body?.rent),
      bedrooms: toNumber(body?.bedrooms),
      bathrooms: toNumber(body?.bathrooms),
      sqft: body?.sqft ? toNumber(body.sqft) : undefined,
      availableDate: typeof body?.availableDate === "string" ? body.availableDate : undefined,
      photos: Array.isArray(body?.photos)
        ? body.photos.filter((url): url is string => typeof url === "string")
        : [],
      neighborhood: typeof body?.neighborhood === "string" ? body.neighborhood : undefined,
      propertyType: typeof body?.propertyType === "string" ? body.propertyType : undefined,
      zillowUrl: typeof body?.zillowUrl === "string" ? body.zillowUrl : undefined,
      zpid: typeof body?.zpid === "string" ? body.zpid : undefined,
    },
    viewer.user.id
  );

  return NextResponse.json({ listing }, { status: 201 });
}
