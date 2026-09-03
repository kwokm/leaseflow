import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { blobEnabled } from "@/lib/config/env";
import { newId } from "@/lib/ids";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Matches the accept list on the client file pickers. */
const ALLOWED_MIME = new Set([
  "image/png",
  "image/jpeg",
  "image/heic",
  "image/webp",
  "application/pdf",
]);

const MAX_BYTES = 10 * 1024 * 1024;

const ALLOWED_KINDS = new Set([
  "photo_id_front",
  "photo_id_back",
  "paystub",
  "bank_statement",
  "w2",
  "form_1099",
]);

/**
 * Stores an applicant document in Blob so it survives a reload.
 *
 * Uploads are private: these are photo IDs and pay stubs, and a public blob URL
 * stays readable by anyone who ever sees it. Reads go through
 * /api/uploads/file, which requires a session.
 */
export async function POST(request: Request) {
  if (!blobEnabled()) {
    return NextResponse.json(
      { error: "File storage is not configured. Set BLOB_READ_WRITE_TOKEN." },
      { status: 503 }
    );
  }

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  const kind = String(form?.get("kind") ?? "");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file was uploaded." }, { status: 400 });
  }
  if (!ALLOWED_KINDS.has(kind)) {
    return NextResponse.json({ error: "Unknown document type." }, { status: 400 });
  }
  if (!ALLOWED_MIME.has(file.type)) {
    return NextResponse.json({ error: "Upload a JPG, PNG, or PDF." }, { status: 415 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "That file is larger than 10 MB." }, { status: 413 });
  }

  // Server-generated pathname: a client-supplied name could traverse or collide.
  const extension = file.name.includes(".") ? file.name.split(".").pop() : undefined;
  const pathname = `applications/${kind}/${newId("doc")}${extension ? `.${extension}` : ""}`;

  const blob = await put(pathname, file, {
    access: "private",
    addRandomSuffix: true,
    contentType: file.type,
  });

  return NextResponse.json({
    // Never the raw blob URL — reads are proxied so they can be authorized.
    url: `/api/uploads/file?path=${encodeURIComponent(blob.pathname)}`,
    pathname: blob.pathname,
    name: file.name,
    size: file.size,
    mime: file.type,
  });
}
