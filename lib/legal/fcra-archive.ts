import "server-only";

import { createHash } from "crypto";
import {
  CONSENT_AUTH_CHECKBOX,
  CONSENT_USE_CHECKBOX,
  CREDIT_CA_NOTICE,
  CREDIT_CONSENT_LOCALE,
  CREDIT_DISCLOSURE_BODY,
  CREDIT_DISCLOSURE_HEADING,
  FCRA_PACK_VERSION,
} from "@/lib/legal/fcra";

export function creditDisclosureSha256(text: string = CREDIT_DISCLOSURE_BODY): string {
  return createHash("sha256").update(text, "utf8").digest("hex");
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Snapshot of the disclosure the applicant saw at click time. */
export function creditDisclosureSnapshotHtml(input: {
  typedFullName: string;
  recipientName: string;
  locale?: string;
}): string {
  const paragraphs = CREDIT_DISCLOSURE_BODY.split("\n\n")
    .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
    .join("");

  return `<article data-copy-version="${escapeHtml(FCRA_PACK_VERSION)}" lang="${escapeHtml(input.locale ?? CREDIT_CONSENT_LOCALE)}">
<h1>${escapeHtml(CREDIT_DISCLOSURE_HEADING)}</h1>
${paragraphs}
<p>${escapeHtml(CREDIT_CA_NOTICE)}</p>
<ul>
<li data-checkbox="auth">${escapeHtml(CONSENT_AUTH_CHECKBOX)}</li>
<li data-checkbox="use">${escapeHtml(CONSENT_USE_CHECKBOX)}</li>
</ul>
<p data-field="typed-full-name">${escapeHtml(input.typedFullName.trim())}</p>
<p data-field="recipient">${escapeHtml(input.recipientName)}</p>
</article>`;
}
