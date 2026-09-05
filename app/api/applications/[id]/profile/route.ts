import { NextResponse } from "next/server";
import { getDeskApplicant } from "@/lib/applications/service";
import { getDeskLandlord } from "@/lib/auth/current-user";
import { privateBetaResponse } from "@/lib/auth/desk-response";
import { databaseEnabled } from "@/lib/config/env";
import { hasTokenLeak } from "@/lib/social/snapshot";

export const dynamic = "force-dynamic";

/** Owner-only bio + social snapshots. Tokens are never selected. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!databaseEnabled()) {
    return NextResponse.json({ error: "Set DATABASE_URL." }, { status: 503 });
  }

  const desk = await getDeskLandlord();
  if (desk.status === "signed-out") {
    return NextResponse.json({ error: "Sign in to view this profile." }, { status: 401 });
  }
  if (desk.status === "not-invited") return privateBetaResponse();
  const ownerId = desk.viewer?.user?.id;
  if (!ownerId) {
    return NextResponse.json({ error: "Sign in to view this profile." }, { status: 401 });
  }

  const { id } = await params;
  const applicant = await getDeskApplicant(ownerId, id);
  if (!applicant) {
    return NextResponse.json({ error: "Application not found." }, { status: 404 });
  }
  if (applicant.profile && hasTokenLeak(applicant.profile)) {
    return NextResponse.json({ error: "Refusing to return a token-bearing payload." }, { status: 500 });
  }
  return NextResponse.json({ profile: applicant.profile ?? null });
}
