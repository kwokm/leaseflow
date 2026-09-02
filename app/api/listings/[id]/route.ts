import { NextResponse } from "next/server";
import { getProperty } from "@/lib/listings/service";

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
  const listing = await getProperty(id);
  if (!listing) return NextResponse.json({ error: "Listing not found." }, { status: 404 });
  return NextResponse.json({ listing });
}
