import { NextResponse } from "next/server";
import { isLandlordEmailAllowed, PRIVATE_BETA_MESSAGE } from "@/lib/auth/beta-allowlist";

export const dynamic = "force-dynamic";

/**
 * Pre-check for landlord signup. Does not create an account and does not
 * reveal who is on the list — only whether this email may open a desk.
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { email?: unknown } | null;
  const email = typeof body?.email === "string" ? body.email : "";

  if (!email.trim()) {
    return NextResponse.json({ error: "Enter the email you were invited with." }, { status: 400 });
  }

  const allowed = isLandlordEmailAllowed(email);
  return NextResponse.json({
    allowed,
    error: allowed ? null : PRIVATE_BETA_MESSAGE,
  });
}
