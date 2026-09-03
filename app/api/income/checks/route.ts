import { NextResponse } from "next/server";
import { getDeskLandlord } from "@/lib/auth/current-user";
import { databaseEnabled } from "@/lib/config/env";
import { isIncomeDocKind } from "@/lib/income/extract";
import {
  enqueueIncomeCheck,
  getIncomeChecksByApplication,
  getIncomeChecksByIds,
  getIncomeChecksByListing,
  publicChecks,
} from "@/lib/income/service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Apply flow enqueue. Same bar as /api/uploads: a renter mid-apply may not
 * have a Clerk session, so a freshly uploaded private blob path is enough.
 */
export async function POST(request: Request) {
  if (!databaseEnabled()) {
    return NextResponse.json(
      { error: "Income checks need a database. Set DATABASE_URL." },
      { status: 503 },
    );
  }

  const body = (await request.json().catch(() => null)) as {
    listingId?: string;
    applicationId?: string;
    documentId?: string;
    applicantName?: string;
    docKind?: string;
    blobPath?: string;
    fileName?: string;
  } | null;

  const docKind = String(body?.docKind ?? "");
  const blobPath = String(body?.blobPath ?? "");
  const fileName = String(body?.fileName ?? "").trim();

  if (!isIncomeDocKind(docKind)) {
    return NextResponse.json({ error: "Unknown document type." }, { status: 400 });
  }
  if (!blobPath.startsWith("applications/") || !fileName) {
    return NextResponse.json({ error: "Upload the file before requesting a check." }, { status: 400 });
  }

  try {
    const row = await enqueueIncomeCheck({
      listingId: body?.listingId ?? null,
      applicationId: body?.applicationId ?? null,
      documentId: body?.documentId ?? null,
      applicantName: String(body?.applicantName ?? "").trim(),
      docKind,
      blobPath,
      fileName,
    });
    return NextResponse.json({ check: publicChecks([row])[0] }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not enqueue that income check.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

/**
 * Poll for the apply UI (`ids=`) or landlord packet (`applicationId` /
 * `listingId`). Unguessable ids are enough for the renter who just uploaded.
 * Listing-wide reads require a desk session.
 */
export async function GET(request: Request) {
  if (!databaseEnabled()) {
    return NextResponse.json({ checks: [], unavailable: true });
  }

  const url = new URL(request.url);
  const ids = (url.searchParams.get("ids") ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
  const applicationId = url.searchParams.get("applicationId")?.trim() ?? "";
  const listingId = url.searchParams.get("listingId")?.trim() ?? "";

  if (!ids.length && !applicationId && !listingId) {
    return NextResponse.json({ error: "Pass ids, applicationId, or listingId." }, { status: 400 });
  }

  if (listingId && !ids.length && !applicationId) {
    const desk = await getDeskLandlord();
    if (desk.status === "signed-out") {
      return NextResponse.json({ error: "Sign in to view income checks." }, { status: 401 });
    }
    if (desk.status === "not-invited") {
      return NextResponse.json({ error: "This desk is invite-only." }, { status: 403 });
    }
  }

  try {
    const rows = ids.length
      ? await getIncomeChecksByIds(ids)
      : applicationId
        ? await getIncomeChecksByApplication(applicationId)
        : await getIncomeChecksByListing(listingId);
    return NextResponse.json({ checks: publicChecks(rows) });
  } catch (error) {
    console.error("[income] Could not read income checks.", error);
    return NextResponse.json({ checks: [], unavailable: true });
  }
}
