import { NextResponse } from "next/server";
import { getDeskLandlord, getViewer } from "@/lib/auth/current-user";
import { privateBetaResponse } from "@/lib/auth/desk-response";
import { databaseEnabled, isDemoMode } from "@/lib/config/env";
import { isAdverseActionType, parseActionTypes } from "@/lib/legal/adverse-action";
import type { AdverseActionType } from "@/lib/legal/fcra";
import {
  AdverseActionError,
  applicationForNotice,
  listAdverseActionNotices,
  listingOwnedBy,
  scoreFromStoredShare,
  sendAdverseActionNotice,
  type AdverseActionScoreSource,
} from "@/lib/screening/adverse-action";

export const dynamic = "force-dynamic";

function clientCanRead(input: {
  demo: boolean;
  viewerId: string | null;
  landlordId: string | null;
  applicantUserId: string | null;
  listingOwned: boolean;
}): boolean {
  if (input.demo) return true;
  if (!input.viewerId) return false;
  if (input.listingOwned) return true;
  if (input.applicantUserId && input.applicantUserId === input.viewerId) return true;
  return false;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const demo = isDemoMode();
  const viewer = await getViewer("landlord");

  if (!demo && !viewer) {
    return NextResponse.json({ error: "Sign in to view this notice." }, { status: 401 });
  }

  const application = await applicationForNotice(id);
  const notices = application ? await listAdverseActionNotices(application.id) : [];

  if (application) {
    const listingOwned = viewer?.user
      ? await listingOwnedBy(application.listingId, viewer.user.id)
      : false;
    if (
      !clientCanRead({
        demo,
        viewerId: viewer?.user?.id ?? null,
        landlordId: null,
        applicantUserId: application.applicantUserId,
        listingOwned,
      })
    ) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }
  }

  return NextResponse.json({ notices });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const demo = isDemoMode();
  const desk = await getDeskLandlord();
  if (desk.status === "signed-out") {
    return NextResponse.json({ error: "Sign in to send this notice." }, { status: 401 });
  }
  if (desk.status === "not-invited") return privateBetaResponse();
  const viewer = desk.viewer;

  const body = (await request.json().catch(() => null)) as {
    listingId?: string;
    actionTypes?: unknown;
    otherAction?: string;
    applicantFullName?: string;
    applicantEmail?: string;
    propertyAddress?: string;
    landlordName?: string;
    landlordAddress?: string;
    landlordPhone?: string;
    landlordEmail?: string;
    applicantUserId?: string;
    score?: AdverseActionScoreSource | null;
  } | null;

  const actionTypes = parseActionTypes(body?.actionTypes).filter(isAdverseActionType);
  if (!actionTypes.length) {
    return NextResponse.json(
      { error: "Pick at least one action before sending the notice." },
      { status: 400 }
    );
  }

  const application = await applicationForNotice(id);
  if (application && viewer?.user) {
    const owned = await listingOwnedBy(application.listingId, viewer.user.id);
    if (!owned && !demo) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }
  } else if (application && !demo && !viewer?.user && databaseEnabled()) {
    return NextResponse.json({ error: "Sign in to send this notice." }, { status: 401 });
  }

  const storedScore = application ? await scoreFromStoredShare(application.id) : null;
  const score = storedScore ?? body?.score ?? null;

  try {
    const notice = await sendAdverseActionNotice({
      applicationId: application?.id ?? id,
      listingId: application?.listingId ?? body?.listingId ?? "",
      landlordId: viewer?.user?.id ?? null,
      applicantUserId: application?.applicantUserId ?? body?.applicantUserId ?? null,
      applicantFullName: body?.applicantFullName || [application?.firstName, application?.lastName].filter(Boolean).join(" "),
      applicantEmail: body?.applicantEmail || application?.email || "",
      propertyAddress: body?.propertyAddress ?? "",
      actionTypes: actionTypes as AdverseActionType[],
      otherAction: body?.otherAction,
      landlordName: body?.landlordName || [viewer?.firstName, viewer?.lastName].filter(Boolean).join(" "),
      landlordAddress: body?.landlordAddress ?? "",
      landlordPhone: body?.landlordPhone || viewer?.user?.phone || "",
      landlordEmail: body?.landlordEmail || viewer?.email || viewer?.user?.email || "",
      score,
    });

    return NextResponse.json({ notice });
  } catch (error) {
    if (error instanceof AdverseActionError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[adverse-action] Could not send the notice.", error);
    return NextResponse.json({ error: "The notice could not be archived." }, { status: 503 });
  }
}
