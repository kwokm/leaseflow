import { NextResponse } from "next/server";
import { get } from "@vercel/blob";
import { blobEnabled, isDemoMode } from "@/lib/config/env";
import { clerkUserId } from "@/lib/auth/current-user";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Authenticated read-through for private applicant documents.
 *
 * Blobs are stored privately, so this is the only way to see a photo ID or pay
 * stub. A session is required: without it an unguessable URL would still be a
 * bearer token for someone's identity documents.
 */
export async function GET(request: Request) {
  if (!blobEnabled()) {
    return NextResponse.json({ error: "File storage is not configured." }, { status: 503 });
  }

  if (!isDemoMode() && !(await clerkUserId())) {
    return NextResponse.json({ error: "Sign in to view this document." }, { status: 401 });
  }

  const path = new URL(request.url).searchParams.get("path");
  if (!path || !path.startsWith("applications/")) {
    return NextResponse.json({ error: "Unknown document." }, { status: 400 });
  }

  const result = await get(path, { access: "private" });
  if (!result) return NextResponse.json({ error: "Document not found." }, { status: 404 });

  return new NextResponse(result.stream, {
    headers: {
      "content-type": result.blob.contentType ?? "application/octet-stream",
      // Applicant documents must not be cached by shared caches.
      "cache-control": "private, no-store",
    },
  });
}
