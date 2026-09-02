import { NextResponse } from "next/server";
import { appOrigin, isDemoMode } from "@/lib/config/env";
import { experianConnect } from "@/lib/screening/experian-connect";

export const dynamic = "force-dynamic";

/**
 * Step 3 of the apply flow: the applicant permissions an Experian Connect share.
 *
 * This records intent only. No report is requested here — that happens
 * server-side after Stripe confirms the $24.99 fee (charge then screen). The
 * request body carries no SSN and the response carries no report.
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    listingId?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  } | null;

  if (!body?.email || !body.listingId) {
    return NextResponse.json({ error: "Missing applicant details." }, { status: 400 });
  }

  // The application row does not exist yet; the share is re-authorized against
  // the real application id at submit time.
  const authorization = await experianConnect().authorize({
    applicationId: `pending-${body.listingId}`,
    returnUrl: `${appOrigin()}/apply/${body.listingId}`,
    recipientReference: body.listingId,
    applicant: {
      firstName: body.firstName ?? "",
      lastName: body.lastName ?? "",
      email: body.email,
    },
  });

  return NextResponse.json({
    shareReference: authorization.shareReference,
    kbaUrl: authorization.kbaUrl,
    inquiryType: authorization.inquiryType,
    // Demo deployments show the fabricated score immediately; real ones wait
    // for payment and then for Experian.
    previewAvailable: isDemoMode(),
  });
}
