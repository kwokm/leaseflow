import { NextResponse } from "next/server";
import { getDeskLandlord } from "@/lib/auth/current-user";
import { privateBetaResponse } from "@/lib/auth/desk-response";
import { databaseEnabled, isDemoMode } from "@/lib/config/env";
import { createListing, listPropertiesSafely, type ListingInput } from "@/lib/listings/service";

export const dynamic = "force-dynamic";

/**
 * Landlords see their own listings, and only their own. Without a session there
 * is nothing to scope by, so the response is the demo catalogue (empty unless
 * LEASEPROOF_DEMO=1) rather than every landlord's listings.
 *
 * A read failure returns `unavailable` rather than an error status: the desk
 * needs to render either way, and an empty pipeline it cannot vouch for should
 * not be drawn as "you have no listings".
 */
export async function GET() {
  const desk = await getDeskLandlord();
  if (desk.status === "not-invited") return privateBetaResponse();
  if (desk.status === "signed-out") {
    return NextResponse.json({ listings: [], demo: isDemoMode() });
  }

  const viewer = desk.viewer;

  // Signed in, but we never got as far as their row — do not answer "no listings".
  if (viewer?.storageUnavailable) {
    return NextResponse.json({ listings: [], demo: isDemoMode(), unavailable: true });
  }

  const { properties, unavailable } = await listPropertiesSafely(viewer?.user?.id ?? null);
  return NextResponse.json({ listings: properties, demo: isDemoMode(), unavailable });
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
  // owner would be invisible to every desk, including its creator's. Missing
  // for want of a session and missing because Neon would not answer are two
  // different problems, and telling a signed-in landlord to sign in is a lie.
  const desk = await getDeskLandlord();
  if (desk.status === "signed-out") {
    return NextResponse.json({ error: "Sign in to create a listing." }, { status: 401 });
  }
  if (desk.status === "not-invited") return privateBetaResponse();

  const viewer = desk.viewer;
  if (!viewer) {
    return NextResponse.json({ error: "Sign in to create a listing." }, { status: 401 });
  }
  if (!viewer.user) {
    console.error("[listings] Signed-in landlord has no mirrored user row; refusing to save.");
    return NextResponse.json(
      { error: "We can't reach the listing store right now. Try again in a moment." },
      { status: 503 }
    );
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
