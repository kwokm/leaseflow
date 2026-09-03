/**
 * Adverse-action letter renderer. Source of truth: Notion pack
 * `lp-fcra-credit-v1.0` / pack v1.1. Do not paraphrase the letter strings.
 *
 * Client-safe — no Node APIs — so the landlord dialog can preview the exact
 * text that will be archived.
 */

import {
  ADVERSE_ACTION_ACTIONS,
  ADVERSE_ACTION_SUBJECT,
  EXPERIAN_NOTICE_CONTACTS,
  FCRA_PACK_VERSION,
  type AdverseActionType,
} from "@/lib/legal/fcra";

export type CreditScoreFields = {
  score: string;
  scoreDate: string;
  rangeLow?: string;
  rangeHigh?: string;
  factors: string[];
};

export type AdverseActionLetterInput = {
  letterDate: string;
  applicantFullName: string;
  applicantEmail: string;
  propertyAddress: string;
  actionTypes: AdverseActionType[];
  otherAction?: string;
  landlordName: string;
  landlordAddress: string;
  landlordPhone: string;
  landlordEmail: string;
  /** Include only when a score from the packet was used. Do not invent fields. */
  creditScore?: CreditScoreFields;
};

const ACTION_IDS = new Set<string>(ADVERSE_ACTION_ACTIONS.map((row) => row.id));

export function isAdverseActionType(value: string): value is AdverseActionType {
  return ACTION_IDS.has(value);
}

export function parseActionTypes(values: unknown): AdverseActionType[] {
  if (!Array.isArray(values)) return [];
  return values.filter((value): value is AdverseActionType => {
    return typeof value === "string" && isAdverseActionType(value);
  });
}

function checked(on: boolean): string {
  return on ? "[x]" : "[ ]";
}

function inquiryFactor(text: string): boolean {
  return /inquir/i.test(text);
}

/**
 * Credit-score block. Exact pack strings. Only fields present on the packet
 * are filled — range and factor lines are omitted when the packet has none.
 * If inquiry-count is already a key factor, it is included even as a fifth line.
 */
export function renderCreditScoreBlock(fields: CreditScoreFields): string {
  const lines = [
    "We also used a credit score from Experian in this decision.",
    "",
    `Your credit score: ${fields.score}`,
    `Date the score was created: ${fields.scoreDate}`,
  ];

  if (fields.rangeLow && fields.rangeHigh) {
    lines.push(`Score range under this model: ${fields.rangeLow} to ${fields.rangeHigh}`);
  }

  lines.push("Person or entity that provided the score: Experian");

  const factors = fields.factors.map((factor) => factor.trim()).filter(Boolean);
  const listed = factors.slice(0, 4);
  const extraInquiry = factors.slice(4).find(inquiryFactor);
  if (listed.length === 4 && !listed.some(inquiryFactor) && extraInquiry) {
    listed.push(extraInquiry);
  } else if (factors.length > 4 && factors[4] && inquiryFactor(factors[4])) {
    listed.push(factors[4]);
  }

  if (listed.length) {
    lines.push("Key factors that adversely affected the score (most important first):");
    listed.forEach((factor, index) => {
      lines.push(`${index + 1}. ${factor}`);
    });
  }

  return lines.join("\n");
}

export function renderAdverseActionSubject(propertyAddress: string): string {
  return ADVERSE_ACTION_SUBJECT.replace("{{property_address}}", propertyAddress.trim());
}

export function renderAdverseActionLetter(input: AdverseActionLetterInput): string {
  const selected = new Set(input.actionTypes);
  const otherText = selected.has("other") ? input.otherAction?.trim() ?? "" : "";

  const actionLines = ADVERSE_ACTION_ACTIONS.map((action) => {
    const mark = checked(selected.has(action.id));
    if (action.id === "other") {
      return `${mark} Other: ${otherText}`;
    }
    return `${mark} ${action.label}`;
  });

  const scoreBlock = input.creditScore ? renderCreditScoreBlock(input.creditScore) : "";

  const parts = [
    input.letterDate,
    "",
    input.applicantFullName,
    input.applicantEmail,
    "",
    `Re: ${input.propertyAddress}`,
    "",
    "We are writing about your rental application for the property above.",
    "",
    "We have taken the following action:",
    ...actionLines,
    "",
    "This action was based in whole or in part on information in a consumer report from Experian.",
    "",
    "Experian did not make this decision and cannot explain it. We did.",
    "",
    "You have the right to obtain a free copy of your Experian consumer report if you request it within 60 days of this notice. Under California law, you also have the right to obtain a free copy within 60 days from any other nationwide consumer credit reporting agency (AnnualCreditReport.com or (877) 322-8228). You also have the right to dispute with Experian the accuracy or completeness of any information in that report.",
    "",
    "Experian (nationwide consumer reporting agency)",
    `Website: ${EXPERIAN_NOTICE_CONTACTS.website}`,
    `Phone: ${EXPERIAN_NOTICE_CONTACTS.phone}`,
    `To request your nationwide reports: ${EXPERIAN_NOTICE_CONTACTS.annualCreditReport} or ${EXPERIAN_NOTICE_CONTACTS.annualCreditReportPhone}`,
  ];

  if (scoreBlock) {
    parts.push("", scoreBlock);
  }

  parts.push(
    "",
    "If you have questions about this notice, contact:",
    input.landlordName,
    input.landlordAddress,
    input.landlordPhone,
    input.landlordEmail,
    "",
    "Leaseproof (AAI Suzuki LLC) helped you share this report. Leaseproof is not a consumer reporting agency and did not decide this action.",
    "",
    "A summary of your rights under the Fair Credit Reporting Act is enclosed."
  );

  return parts.join("\n");
}

export function formatNoticeDate(value: Date | string = new Date()): string {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return typeof value === "string" ? value : "";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export type PacketScoreSource = {
  score?: number | null;
  scoreModel?: string | null;
  pulledAt?: string | null;
  scoreDate?: string | null;
  scoreRangeLow?: string | number | null;
  scoreRangeHigh?: string | number | null;
  rangeLow?: string | number | null;
  rangeHigh?: string | number | null;
  factors?: string[] | null;
};

/** Pull score-block fields from the packet. Do not invent missing values. */
export function creditScoreFromPacket(
  source?: PacketScoreSource | null
): CreditScoreFields | undefined {
  if (source?.score == null) return undefined;

  const factors = Array.isArray(source.factors)
    ? source.factors.filter(
        (factor): factor is string => typeof factor === "string" && Boolean(factor.trim())
      )
    : [];

  const rangeLowRaw = source.rangeLow ?? source.scoreRangeLow;
  const rangeHighRaw = source.rangeHigh ?? source.scoreRangeHigh;
  const rangeLow =
    rangeLowRaw != null && String(rangeLowRaw).trim() ? String(rangeLowRaw) : undefined;
  const rangeHigh =
    rangeHighRaw != null && String(rangeHighRaw).trim() ? String(rangeHighRaw) : undefined;

  return {
    score: String(source.score),
    scoreDate: formatNoticeDate(source.scoreDate || source.pulledAt || ""),
    rangeLow,
    rangeHigh,
    factors,
  };
}

export const ADVERSE_ACTION_COPY_VERSION = FCRA_PACK_VERSION;
