import { NextResponse } from "next/server";
import { appOrigin, isDemoMode } from "@/lib/config/env";
import { getViewer } from "@/lib/auth/current-user";
import { experianConnect } from "@/lib/screening/experian-connect";
import {
  CreditConsentGateError,
  archiveCreditConsent,
  attachExperianShare,
} from "@/lib/screening/credit-consent";
import {
  CREDIT_ERROR_EXPERIAN_UNAVAILABLE,
  CREDIT_ERROR_KBA_FAILED,
  creditConsentReady,
} from "@/lib/legal/fcra";

export const dynamic = "force-dynamic";

function clientIp(request: Request): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded ? forwarded.split(",")[0].trim() : null;
}

/**
 * Credit step: persist the consent archive, then (and only then) start the
 * Experian Connect stub. No SSN, no KBA answers, no report in this response.
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    listingId?: string;
    applicationId?: string;
    consentId?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    checkboxAuth?: boolean;
    checkboxUse?: boolean;
    typedFullName?: string;
    locale?: string;
  } | null;

  if (!body?.email || !body.listingId) {
    return NextResponse.json({ error: "Missing applicant details." }, { status: 400 });
  }

  if (
    !creditConsentReady({
      checkboxAuth: Boolean(body.checkboxAuth),
      checkboxUse: Boolean(body.checkboxUse),
      typedFullName: body.typedFullName ?? "",
    })
  ) {
    return NextResponse.json(
      { error: "Both checkboxes and a typed full name are required before Experian can start." },
      { status: 400 }
    );
  }

  const viewer = await getViewer("renter");

  let consent;
  try {
    consent = await archiveCreditConsent({
      listingId: body.listingId,
      applicationId: body.applicationId,
      existingConsentId: body.consentId,
      applicantUserId: viewer?.user?.id ?? null,
      firstName: body.firstName ?? "",
      lastName: body.lastName ?? "",
      email: body.email,
      phone: body.phone,
      checkboxAuth: true,
      checkboxUse: true,
      typedFullName: body.typedFullName ?? "",
      locale: body.locale,
      ipAddress: clientIp(request),
      userAgent: request.headers.get("user-agent"),
    });
  } catch (error) {
    if (error instanceof CreditConsentGateError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[screening] Could not archive credit consent.", error);
    return NextResponse.json({ error: "Authorization could not be saved." }, { status: 503 });
  }

  try {
    const authorization = await experianConnect().authorize({
      applicationId: consent.applicationId,
      returnUrl: `${appOrigin()}/apply/${body.listingId}`,
      recipientReference: consent.landlordId ?? body.listingId,
      applicant: {
        firstName: body.firstName ?? "",
        lastName: body.lastName ?? "",
        email: body.email,
      },
    });

    if (!authorization.shareReference) {
      return NextResponse.json(
        {
          error: CREDIT_ERROR_KBA_FAILED,
          consent,
        },
        { status: 422 }
      );
    }

    await attachExperianShare(consent.consentId, authorization.shareReference, true);

    return NextResponse.json({
      shareReference: authorization.shareReference,
      kbaUrl: authorization.kbaUrl,
      inquiryType: authorization.inquiryType,
      previewAvailable: isDemoMode(),
      consent: {
        ...consent,
        experianShareId: authorization.shareReference,
      },
    });
  } catch (error) {
    console.error("[screening] Experian stub failed after consent was saved.", error);
    return NextResponse.json(
      {
        error: CREDIT_ERROR_EXPERIAN_UNAVAILABLE,
        consent,
      },
      { status: 503 }
    );
  }
}
