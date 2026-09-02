import { NextResponse } from "next/server";
import { findProperty } from "@/lib/listings/service";

export const dynamic = "force-dynamic";

/**
 * Public: renters need to read a listing before they have an account, and the
 * response carries nothing beyond what the apply page already shows.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const lookup = await findProperty(id);

  if (lookup.status === "missing") {
    return NextResponse.json({ error: "Listing not found." }, { status: 404 });
  }
  if (lookup.status === "unavailable") {
    return NextResponse.json(
      { error: "We can't reach the listing store right now." },
      { status: 503 }
    );
  }

  return NextResponse.json({ listing: lookup.property });
}
