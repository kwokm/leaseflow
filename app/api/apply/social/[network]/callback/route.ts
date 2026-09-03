import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { appOrigin } from "@/lib/config/env";
import { isSocialNetwork } from "@/lib/social/networks";
import { exchangeAndSnapshot, SocialOAuthError } from "@/lib/social/oauth";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ network: string }> }
) {
  const { network } = await params;
  const url = new URL(request.url);
  const origin = appOrigin();
  const jar = await cookies();
  const raw = jar.get("lp_social_oauth")?.value;
  jar.delete("lp_social_oauth");

  let returnTo = "/apply";
  try {
    if (!isSocialNetwork(network)) throw new SocialOAuthError("Unknown network.");
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    if (!code || !raw) throw new SocialOAuthError("That connect did not finish.");

    const stored = JSON.parse(raw) as {
      state?: string;
      network?: string;
      draftId?: string;
      listingId?: string;
      returnTo?: string;
    };
    returnTo = stored.returnTo || returnTo;
    if (stored.state !== state || stored.network !== network || !stored.draftId) {
      throw new SocialOAuthError("That connect could not be verified.");
    }

    await exchangeAndSnapshot({
      network,
      code,
      draftId: stored.draftId,
      listingId: stored.listingId || null,
    });

    const next = new URL(returnTo, origin);
    next.searchParams.set("social", network);
    next.searchParams.set("socialOk", "1");
    return NextResponse.redirect(next);
  } catch (error) {
    const next = new URL(returnTo, origin);
    next.searchParams.set("social", isSocialNetwork(network) ? network : "instagram");
    next.searchParams.set(
      "socialError",
      error instanceof SocialOAuthError ? error.message : "Could not connect that profile."
    );
    return NextResponse.redirect(next);
  }
}
