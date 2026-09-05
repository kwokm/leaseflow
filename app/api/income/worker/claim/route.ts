import { NextResponse } from "next/server";
import { databaseEnabled } from "@/lib/config/env";
import { requireIncomeWorker } from "@/lib/income/worker-auth";
import { claimNextIncomeCheck } from "@/lib/income/service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  const denied = requireIncomeWorker(request);
  if (denied) return denied;

  if (!databaseEnabled()) {
    return NextResponse.json({ error: "DATABASE_URL is not set." }, { status: 503 });
  }

  const body = (await request.json().catch(() => null)) as { claimedBy?: string } | null;
  const claimedBy = String(body?.claimedBy ?? "studio").slice(0, 80) || "studio";

  try {
    const job = await claimNextIncomeCheck(claimedBy);
    if (!job) {
      return NextResponse.json({ error: "queue empty" }, { status: 404 });
    }

    return NextResponse.json({
      job: {
        id: job.id,
        docKind: job.docKind,
        fileName: job.fileName,
        applicantName: job.applicantName,
      },
      fileUrl: `/api/income/worker/file/${job.id}`,
    });
  } catch (error) {
    console.error("[income] claim failed", error);
    return NextResponse.json({ error: "Could not claim an income check." }, { status: 500 });
  }
}
