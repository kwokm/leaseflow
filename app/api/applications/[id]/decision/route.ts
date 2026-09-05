import { NextResponse } from "next/server";
import { getDeskApplicant, setApplicationDecision } from "@/lib/applications/service";
import { getDeskLandlord } from "@/lib/auth/current-user";
import { privateBetaResponse } from "@/lib/auth/desk-response";
import { databaseEnabled, isDemoMode } from "@/lib/config/env";

export const dynamic = "force-dynamic";

async function deskOwnerId(): Promise<
  | { ok: true; ownerId: string }
  | { ok: false; response: NextResponse }
> {
  const desk = await getDeskLandlord();
  if (desk.status === "signed-out") {
    return {
      ok: false,
      response: NextResponse.json({ error: "Sign in to decide this packet." }, { status: 401 }),
    };
  }
  if (desk.status === "not-invited") {
    return { ok: false, response: privateBetaResponse() };
  }

  const ownerId = desk.viewer?.user?.id ?? null;
  if (!ownerId) {
    if (isDemoMode()) {
      return {
        ok: false,
        response: NextResponse.json(
          { error: "Demo preview has no landlord row to store a decision on." },
          { status: 403 }
        ),
      };
    }
    return {
      ok: false,
      response: NextResponse.json({ error: "Sign in to decide this packet." }, { status: 401 }),
    };
  }

  return { ok: true, ownerId };
}

/**
 * Stored decision for the listing owner. Screening lifecycle stays on
 * applications.status — this only reads decision / decided_at.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!databaseEnabled()) {
    return NextResponse.json({ error: "Set DATABASE_URL." }, { status: 503 });
  }

  const auth = await deskOwnerId();
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const applicant = await getDeskApplicant(auth.ownerId, id);
  if (!applicant) {
    return NextResponse.json({ error: "Application not found." }, { status: 404 });
  }

  return NextResponse.json({ applicant });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!databaseEnabled()) {
    return NextResponse.json({ error: "Set DATABASE_URL." }, { status: 503 });
  }

  const auth = await deskOwnerId();
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const body = (await request.json().catch(() => null)) as { decision?: unknown } | null;
  const result = await setApplicationDecision(auth.ownerId, id, body?.decision);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ applicant: result.applicant });
}
