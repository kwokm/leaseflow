import { NextResponse } from "next/server";
import { getViewer } from "@/lib/auth/current-user";
import { appOrigin, databaseEnabled, isDemoMode, stripeEnabled } from "@/lib/config/env";
import { listDeskApplicants, markDemoPaid, submitApplication } from "@/lib/applications/service";
import { createCheckoutSession } from "@/lib/payments/checkout";
import type { ApplyState } from "@/lib/apply/types";

export const dynamic = "force-dynamic";

/**
 * Desk queue for the signed-in landlord, optionally scoped to one listing.
 *
 * A session is required. Without this check an unauthenticated caller would get
 * every application in the database — middleware only protects /dashboard, not
 * this route.
 */
export async function GET(request: Request) {
  if (!databaseEnabled()) return NextResponse.json({ applicants: [] });

  const viewer = await getViewer("landlord");
  if (!viewer?.user) {
    // Demo deployments have no session by design and no landlord rows to leak.
    if (isDemoMode()) return NextResponse.json({ applicants: [] });
    return NextResponse.json({ error: "Sign in to view applications." }, { status: 401 });
  }

  const listingId = new URL(request.url).searchParams.get("listingId") ?? undefined;
  const applicants = await listDeskApplicants(viewer.user.id, listingId);
  return NextResponse.json({ applicants });
}

function clientIp(request: Request): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded ? forwarded.split(",")[0].trim() : null;
}

/**
 * Submit the packet, then hand off to Stripe. The application is stored as
 * `awaiting_payment` and no credit share is requested until the fee clears.
 */
export async function POST(request: Request) {
  if (!databaseEnabled()) {
    return NextResponse.json(
      { error: "Applications need a database. Set DATABASE_URL to submit one." },
      { status: 503 }
    );
  }

  const body = (await request.json().catch(() => null)) as { state?: ApplyState } | null;
  const state = body?.state;
  if (!state?.listingId || !state.personal?.email) {
    return NextResponse.json({ error: "That application is incomplete." }, { status: 400 });
  }

  // Renters may apply without an account; when signed in we link the packet to
  // them so they can find it again.
  const viewer = await getViewer("renter");
  const origin = appOrigin();

  let application;
  try {
    application = await submitApplication(state, {
      applicantUserId: viewer?.user?.id ?? null,
      ipAddress: clientIp(request),
      userAgent: request.headers.get("user-agent"),
      returnUrl: `${origin}/apply/${state.listingId}`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not submit that application.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (!stripeEnabled()) {
    if (!isDemoMode()) {
      return NextResponse.json(
        {
          error:
            "Payments are not configured. Set STRIPE_SECRET_KEY before taking applications.",
          applicationId: application.id,
        },
        { status: 503 }
      );
    }

    // Demo preview only: nothing is charged, but the packet still completes so
    // the click-through works.
    await markDemoPaid(application.id);
    return NextResponse.json({
      application,
      checkoutUrl: null,
      demoSkippedPayment: true,
    });
  }

  const checkout = await createCheckoutSession({
    applicationId: application.id,
    confirmationId: application.confirmationId,
    email: state.personal.email,
    listingId: state.listingId,
    origin,
  });

  return NextResponse.json({ application, checkoutUrl: checkout.url });
}
