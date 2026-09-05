import { NextResponse } from "next/server";
import { databaseEnabled } from "@/lib/config/env";
import { requireIncomeWorker } from "@/lib/income/worker-auth";
import { completeIncomeCheck, publicChecks } from "@/lib/income/service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  const denied = requireIncomeWorker(request);
  if (denied) return denied;

  if (!databaseEnabled()) {
    return NextResponse.json({ error: "DATABASE_URL is not set." }, { status: 503 });
  }

  const body = (await request.json().catch(() => null)) as {
    id?: string;
    status?: string;
    errorText?: string | null;
    extractor?: string | null;
    rawText?: string | null;
    rawJson?: Record<string, unknown> | null;
    detectedName?: string | null;
    employer?: string | null;
    payFrequency?: string | null;
    periodStart?: string | null;
    periodEnd?: string | null;
    grossThisPeriodCents?: number | null;
    ytdGrossCents?: number | null;
    monthlyGrossCents?: number | null;
    recencyCurrent?: boolean | null;
  } | null;

  if (!body?.id) {
    return NextResponse.json({ error: "Missing income check id." }, { status: 400 });
  }
  if (body.status !== "ready" && body.status !== "error") {
    return NextResponse.json({ error: "status must be ready or error." }, { status: 400 });
  }

  try {
    const row = await completeIncomeCheck({
      id: body.id,
      status: body.status,
      errorText: body.errorText,
      extractor: body.extractor,
      rawText: body.rawText,
      rawJson: body.rawJson,
      detectedName: body.detectedName,
      employer: body.employer,
      payFrequency: body.payFrequency,
      periodStart: body.periodStart,
      periodEnd: body.periodEnd,
      grossThisPeriodCents: body.grossThisPeriodCents,
      ytdGrossCents: body.ytdGrossCents,
      monthlyGrossCents: body.monthlyGrossCents,
      recencyCurrent: body.recencyCurrent,
    });
    return NextResponse.json({ check: publicChecks([row])[0] });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not complete that income check.";
    const status = message.includes("not found") ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
