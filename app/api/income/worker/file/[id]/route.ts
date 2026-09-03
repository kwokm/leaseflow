import { NextResponse } from "next/server";
import { get } from "@vercel/blob";
import { blobEnabled } from "@/lib/config/env";
import { requireIncomeWorker } from "@/lib/income/worker-auth";
import { getIncomeCheck } from "@/lib/income/service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = requireIncomeWorker(request);
  if (denied) return denied;

  if (!blobEnabled()) {
    return NextResponse.json({ error: "File storage is not configured." }, { status: 503 });
  }

  const { id } = await params;
  const row = await getIncomeCheck(id);
  if (!row?.blobPath || !row.blobPath.startsWith("applications/")) {
    return NextResponse.json({ error: "Document not found." }, { status: 404 });
  }

  const result = await get(row.blobPath, { access: "private" });
  if (!result) return NextResponse.json({ error: "Document not found." }, { status: 404 });

  return new NextResponse(result.stream, {
    headers: {
      "content-type": result.blob.contentType ?? "application/octet-stream",
      "content-disposition": `attachment; filename="${encodeURIComponent(row.fileName)}"`,
      "cache-control": "private, no-store",
      "x-income-check-id": row.id,
    },
  });
}
