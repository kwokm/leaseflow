/**
 * Credit-step copy. Source of truth: Notion pack `lp-fcra-credit-v1.0`.
 *
 * Do not paraphrase these strings. If a word changes, bump FCRA_PACK_VERSION
 * and `copySha256` in the same change. Attorney-review required before any
 * use as legal advice — that watermark is for humans, not the applicant UI.
 *
 * Hashing and HTML snapshots live in `fcra-archive.ts` (server-only) so this
 * file stays importable from the Credit-step client.
 */

export const FCRA_PACK_VERSION = "lp-fcra-credit-v1.0";

export const CREDIT_STEP_LABEL = "Credit";

export const CREDIT_STEP_TITLE = "Share your Experian report";

export const CREDIT_STEP_DECK =
  "You authenticate with Experian and share your consumer report with this landlord for this application. Leaseproof is not a consumer reporting agency. Experian is.";

export const CREDIT_HOW_THIS_WORKS = [
  "You confirm the disclosure and authorization below.",
  "Experian verifies it is you.",
  "Your report is shared with this landlord inside the Leaseproof packet.",
] as const;

export const CREDIT_HOW_THIS_WORKS_HELPER =
  "This is not a new loan application, and it is not a landlord running a bureau pull through their own subscriber account.";

export const CREDIT_DISCLOSURE_HEADING = "Credit report disclosure and authorization";

/**
 * Exact disclosure body, including the copy-version line. Persist this string
 * verbatim on every consent row.
 */
export const CREDIT_DISCLOSURE_BODY = [
  "AAI Suzuki LLC, doing business as Leaseproof, will help you share a consumer report from Experian with the landlord for this rental application.",
  "Experian is a consumer reporting agency. A consumer report can include credit history and a credit score. The landlord may use this report to decide whether to rent to you and on what terms, including deposit or co-signer conditions.",
  "You are giving written instructions for Experian to furnish this report for that housing purpose. The report may be used only for this rental application. It may not be used for employment, insurance, or unrelated credit decisions.",
  "Leaseproof is not a consumer reporting agency and does not decide whether you get the unit. The landlord does.",
  "If the landlord takes an unfavorable action based even in part on this report — for example denying the application, requiring a co-signer, or asking for a larger deposit or higher rent than another applicant — federal law requires them to give you an adverse-action notice. That notice must name Experian and explain your right to a free copy of the report (if you ask within 60 days) and your right to dispute inaccurate information.",
  "Copy version `lp-fcra-credit-v1.0`.",
].join("\n\n");

/** Factual CA line. Not a third checkbox. */
export const CREDIT_CA_NOTICE =
  "California: if this landlord takes an unfavorable action based on this credit report, they must notify you in writing.";

export const CONSENT_AUTH_CHECKBOX =
  "I have read this disclosure. I authorize AAI Suzuki LLC (Leaseproof) to obtain my Experian consumer report under my written instructions and to share it with this landlord for this rental application only.";

export const CONSENT_USE_CHECKBOX =
  "I understand this landlord may use the shared Experian report to evaluate this housing application.";

export const CREDIT_PRIMARY_ACTION = "Continue with Experian";

export const CREDIT_SECONDARY_ACTION = "Don’t share a report";

export const CREDIT_DECLINE_MESSAGE =
  "This application needs a shared Experian report. You can go back, or leave this application.";

export const CREDIT_ERROR_EXPERIAN_UNAVAILABLE =
  "We could not reach Experian. Your authorization was saved. Try again. Nothing was shared with the landlord.";

export const CREDIT_ERROR_KBA_FAILED =
  "Experian could not verify it was you. Nothing was shared. You can try again.";

export const CREDIT_SUCCESS_MESSAGE =
  "Your Experian report is in the packet for this landlord. Next is Pay.";

export const CREDIT_CONSENT_PURPOSE = "housing_application";

export const CREDIT_CONSENT_LOCALE = "en-US";

export const CONSENT_KIND = {
  /** Authorization to obtain an Experian consumer report for this application. */
  fcraCredit: "fcra_credit",
  /** Permission for Experian Connect to share the report with this landlord. */
  experianConnect: "experian_connect",
} as const;

export type ConsentKind = (typeof CONSENT_KIND)[keyof typeof CONSENT_KIND];

export function creditConsentReady(input: {
  checkboxAuth: boolean;
  checkboxUse: boolean;
  typedFullName: string;
}): boolean {
  return input.checkboxAuth && input.checkboxUse && input.typedFullName.trim().length > 0;
}

/**
 * Adverse-action letter copy. Same pack (`lp-fcra-credit-v1.0` / pack v1.1).
 * Do not paraphrase. Attorney-review required.
 */

export const ADVERSE_ACTION_SUBJECT =
  "Notice about your application at {{property_address}}";

export const ADVERSE_ACTION_HELPER =
  "If you deny this applicant, require a co-signer, or set a higher deposit or rent than you would for another applicant, and this Experian report played any part in that decision, send the written adverse-action notice. Leaseproof can generate it. You are still the one taking the action.";

export const LANDLORD_COVID_RENTAL_DEBT_LINE =
  "Do not treat alleged COVID-19 rental debt as a negative factor when you evaluate this applicant (Cal. Civ. Code § 1785.20.4).";

export const ADVERSE_ACTION_ACTIONS = [
  { id: "denied", label: "Denied the application" },
  { id: "required_cosigner", label: "Required a co-signer" },
  {
    id: "required_deposit",
    label: "Required a deposit that would not be required of another applicant",
  },
  {
    id: "required_larger_deposit",
    label: "Required a larger deposit than would be required of another applicant",
  },
  {
    id: "charged_higher_rent",
    label: "Charged a higher rent than would be charged to another applicant",
  },
  { id: "other", label: "Other:" },
] as const;

export type AdverseActionType = (typeof ADVERSE_ACTION_ACTIONS)[number]["id"];

export const CFPB_SUMMARY_OF_RIGHTS_HREF =
  "/legal/cfpb-regulation-v-appendix-k-summary-of-rights.pdf";

export const CFPB_SUMMARY_OF_RIGHTS_TITLE =
  "A Summary of Your Rights Under the Fair Credit Reporting Act";

export const EXPERIAN_NOTICE_CONTACTS = {
  website: "experian.com",
  phone: "(888) 397-3742",
  annualCreditReport: "AnnualCreditReport.com",
  annualCreditReportPhone: "(877) 322-8228",
} as const;
