import { NextResponse } from "next/server";
import { publicProfileForDraft } from "@/lib/social/profile";
import { hasTokenLeak } from "@/lib/social/snapshot";

export const dynamic = "force-dynamic";

/** Landlord-safe draft snapshots. Tokens never leave this handler. */
export async function GET(request: Request) {
  const draftId = new URL(request.url).searchParams.get("draftId") ?? "";
  const profile = await publicProfileForDraft(draftId);
  if (profile && hasTokenLeak(profile)) {
    return NextResponse.json({ error: "Refusing to return a token-bearing payload." }, { status: 500 });
  }
  return NextResponse.json({ profile });
}
