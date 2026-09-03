import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isSocialNetwork } from "@/lib/social/networks";
import { authorizeUrl, networkConfigured } from "@/lib/social/oauth";
import { notConfiguredMessage } from "@/lib/social/snapshot";
import { newId } from "@/lib/ids";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ network: string }> }
) {
  const { network } = await params;
  if (!isSocialNetwork(network)) {
    return NextResponse.json({ error: "Unknown network." }, { status: 400 });
  }

  const body = (await request.json().catch(() => null)) as {
    draftId?: string;
    listingId?: string;
    returnTo?: string;
    consented?: boolean;
  } | null;

  if (!body?.consented) {
    return NextResponse.json(
      { error: "Check the box to share these posts with this landlord." },
      { status: 400 }
    );
  }
  if (!body.draftId) {
    return NextResponse.json({ error: "Missing draft id." }, { status: 400 });
  }

  if (!networkConfigured(network)) {
    return NextResponse.json(
      { error: notConfiguredMessage(network), code: "not_configured" },
      { status: 503 }
    );
  }

  const state = newId("oauth");
  const jar = await cookies();
  jar.set(
    "lp_social_oauth",
    JSON.stringify({
      state,
      network,
      draftId: body.draftId,
      listingId: body.listingId ?? "",
      returnTo: body.returnTo || "/apply",
    }),
    { httpOnly: true, sameSite: "lax", path: "/", maxAge: 600 }
  );

  return NextResponse.json({ url: authorizeUrl(network, state) });
}
