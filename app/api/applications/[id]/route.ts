import { NextResponse } from "next/server";
import { getApplicationStatus } from "@/lib/applications/service";
import { databaseEnabled } from "@/lib/config/env";

export const dynamic = "force-dynamic";

/**
 * Payment status for the applicant returning from Stripe Checkout.
 *
 * Only the confirmation code and coarse status are returned — never the packet,
 * which contains the applicant's own data and is not addressable by id alone.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!databaseEnabled()) {
    return NextResponse.json({ error: "Not configured." }, { status: 503 });
  }

  const { id } = await params;
  const application = await getApplicationStatus(id);
  if (!application) {
    return NextResponse.json({ error: "Application not found." }, { status: 404 });
  }

  return NextResponse.json({
    application: {
      id: application.id,
      confirmationId: application.confirmationId,
      status: application.status,
      paid: application.paid,
    },
  });
}
