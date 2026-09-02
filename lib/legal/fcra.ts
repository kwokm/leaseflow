/**
 * Consent copy and its version.
 *
 * The authoritative wording lives in the Notion FCRA pack `lp-fcra-credit-v1.0`.
 * The strings below are PLACEHOLDERS pending that pack — they are deliberately
 * conservative, and every consent row written to Neon records
 * `FCRA_PACK_VERSION` so we always know which wording an applicant agreed to.
 *
 * Two rules this file exists to enforce:
 *  1. Do not restate what a credit check does to someone's score. Experian
 *     Connect is a soft inquiry; that is a fact about the inquiry type, not a
 *     promise about scoring, and no copy here goes further than that.
 *  2. Do not reword these strings ad hoc. Replace them wholesale when the pack
 *     lands, and bump FCRA_PACK_VERSION in the same change.
 */
export const FCRA_PACK_VERSION = "lp-fcra-credit-v1.0";

/** Rendered next to placeholder copy so nobody mistakes it for final wording. */
export const FCRA_PLACEHOLDER_NOTICE =
  `Placeholder copy — final wording comes from the Leaseproof FCRA pack ${FCRA_PACK_VERSION}.`;

export const CONSENT_KIND = {
  /** Authorization to obtain a consumer report for this application. */
  fcraCredit: "fcra_credit",
  /** Acknowledgement that a public-records background search is included. */
  backgroundAck: "background_ack",
  /** Permission for Experian Connect to share the report with this landlord. */
  experianConnect: "experian_connect",
} as const;

export type ConsentKind = (typeof CONSENT_KIND)[keyof typeof CONSENT_KIND];

/** Applicant-facing description of the Experian Connect hand-off. */
export const CONNECT_BULLETS = [
  "Experian verifies your identity, then shares the report with this landlord",
  "Shared for this application only, and access ends when it is decided",
  "The landlord sees a score and summary — never your account numbers",
] as const;

export const CONNECT_INQUIRY_LINE = "Experian Connect uses a soft inquiry.";

export const CREDIT_DISCLOSURE_HEADING =
  "Disclosure regarding consumer reports and investigative consumer reports";

/**
 * Placeholder disclosure body. `address` is interpolated so the applicant sees
 * which tenancy the authorization covers.
 */
export function creditDisclosureParagraphs(address: string): string[] {
  return [
    `In connection with your rental application for ${address}, a consumer report and/or investigative consumer report may be obtained about you. These reports may include information about your credit history, rental history, eviction records, and criminal records, obtained from consumer reporting agencies.`,
    "Under the Fair Credit Reporting Act you have the right to request disclosure of the nature and scope of any investigative consumer report, to know whether a report was obtained, and to receive a free copy of any report that results in an adverse decision. You also have the right to dispute the accuracy or completeness of any information in your file.",
    "If your application is declined based in whole or in part on information in a consumer report, you will receive an adverse action notice identifying the reporting agency and explaining your rights.",
  ];
}

export const CONSENT_FCRA_CHECKBOX =
  "I have read the disclosure and authorize Leaseproof to obtain consumer reports about me for this rental application.";

export const CONSENT_BACKGROUND_CHECKBOX =
  "I understand a public-records background search is part of this screening.";
