import type { ApplicationDocument, ApplicationDetails, DocumentType } from "@/lib/data/mock-data";
import type { ApplyState, LocalFile } from "@/lib/apply/types";

/** Prototype “today” — August 2026. Recency is measured from this date. */
export const PROTOTYPE_TODAY = new Date("2026-08-14T12:00:00.000Z");
export const CURRENT_TAX_YEAR = 2025;

export type IncomeDocKind =
  | "paystub"
  | "bank_statement"
  | "w2"
  | "form_1099"
  | "portfolio"
  | "investment"
  | "other_income";

export type DocCheckRow = {
  id: string;
  fileName: string;
  kind: IncomeDocKind;
  kindLabel: string;
  detectedName: string;
  periodLabel: string;
  nameMatch: boolean;
  recency: "current" | "stale";
  recencyLabel: string;
  extra?: boolean;
};

export type DocCheckReport = {
  rows: DocCheckRow[];
  passed: boolean;
  namePass: boolean;
  recencyPass: boolean;
  checkedCount: number;
};

const KIND_LABEL: Record<IncomeDocKind, string> = {
  paystub: "Pay stub",
  bank_statement: "Bank statement",
  w2: "W-2",
  form_1099: "1099",
  portfolio: "Portfolio statement",
  investment: "Investment statement",
  other_income: "Proof of income",
};

const MONTHS: Record<string, number> = {
  january: 1,
  jan: 1,
  february: 2,
  feb: 2,
  march: 3,
  mar: 3,
  april: 4,
  apr: 4,
  may: 5,
  june: 6,
  jun: 6,
  july: 7,
  jul: 7,
  august: 8,
  aug: 8,
  september: 9,
  sep: 9,
  sept: 9,
  october: 10,
  oct: 10,
  november: 11,
  nov: 11,
  december: 12,
  dec: 12,
};

const STOP = new Set([
  ...Object.keys(MONTHS),
  "paystub",
  "pay",
  "stub",
  "bank",
  "statement",
  "statements",
  "w2",
  "w",
  "form",
  "1099",
  "portfolio",
  "investment",
  "brokerage",
  "demo",
  "id",
  "front",
  "back",
  "photo",
  "drivers",
  "license",
  "passport",
]);

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const SAMPLE_MISMATCH: DocCheckRow = {
  id: "sample-mismatch",
  fileName: "w2-2023-alex-chen.pdf",
  kind: "w2",
  kindLabel: "W-2",
  detectedName: "Alex Chen",
  periodLabel: "Tax year 2023",
  nameMatch: false,
  recency: "stale",
  recencyLabel: "Stale",
  extra: true,
};

function titleCase(value: string): string {
  return value
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function namesEqual(a: string, b: string): boolean {
  return a.trim().toLowerCase().replace(/\s+/g, " ") === b.trim().toLowerCase().replace(/\s+/g, " ");
}

function inferKind(slug: string, docType?: DocumentType): IncomeDocKind | null {
  if (docType === "photo_id_front" || docType === "photo_id_back") return null;
  if (docType === "paystub" || /pay.?stub/.test(slug)) return "paystub";
  if (docType === "bank_statement" || /bank|statement/.test(slug)) {
    if (/broker|invest|portfolio/.test(slug)) return /portfolio/.test(slug) ? "portfolio" : "investment";
    return "bank_statement";
  }
  if (docType === "w2" || /w-?2/.test(slug)) return "w2";
  if (docType === "form_1099" || /1099/.test(slug)) return "form_1099";
  if (docType === "portfolio" || /portfolio/.test(slug)) return "portfolio";
  if (docType === "investment" || /invest|broker/.test(slug)) return "investment";
  if (docType === "other") return "other_income";
  if (/income|offer|award/.test(slug)) return "other_income";
  return null;
}

function parsePeriod(slug: string): { year?: number; month?: number } {
  const yearMatch = slug.match(/20(2[0-9])/);
  const year = yearMatch ? Number(yearMatch[0]) : undefined;
  let month: number | undefined;
  for (const [token, value] of Object.entries(MONTHS)) {
    if (new RegExp(`(?:^|[-_\\s])${token}(?:[-_\\s]|$)`, "i").test(slug)) {
      month = value;
      break;
    }
  }
  return { year, month };
}

function nameFromSlug(slug: string, applicantName: string): string {
  const tokens = slug
    .replace(/\.[^.]+$/, "")
    .split(/[-_\s]+/)
    .filter((token) => /^[a-z]{2,}$/i.test(token) && !STOP.has(token.toLowerCase()) && !/^\d+$/.test(token));
  if (tokens.length >= 2) return titleCase(`${tokens[tokens.length - 2]} ${tokens[tokens.length - 1]}`);
  if (tokens.length === 1) return titleCase(tokens[0]);
  return applicantName;
}

function isAnnual(kind: IncomeDocKind): boolean {
  return kind === "w2" || kind === "form_1099";
}

function isCurrent(kind: IncomeDocKind, year?: number, month?: number): boolean {
  if (isAnnual(kind)) return year === CURRENT_TAX_YEAR;
  if (!year || !month) return false;
  const doc = new Date(Date.UTC(year, month - 1, 1));
  const start = new Date(Date.UTC(PROTOTYPE_TODAY.getUTCFullYear(), PROTOTYPE_TODAY.getUTCMonth() - 2, 1));
  const end = new Date(Date.UTC(PROTOTYPE_TODAY.getUTCFullYear(), PROTOTYPE_TODAY.getUTCMonth() + 1, 1));
  return doc >= start && doc < end;
}

function periodLabel(kind: IncomeDocKind, year?: number, month?: number): string {
  if (isAnnual(kind)) return year ? `Tax year ${year}` : "Tax year unknown";
  if (year && month) return `${MONTH_NAMES[month - 1]} ${year}`;
  if (year) return String(year);
  return "Date not read";
}

function recencyLabel(kind: IncomeDocKind, current: boolean): string {
  if (current) return isAnnual(kind) ? `Current (${CURRENT_TAX_YEAR})` : "Current (2 mo)";
  return "Stale";
}

export function checkIncomeFile(
  fileName: string,
  applicantName: string,
  docType?: DocumentType,
): DocCheckRow | null {
  const slug = fileName.toLowerCase();
  const kind = inferKind(slug, docType);
  if (!kind) return null;

  const { year, month } = parsePeriod(slug);
  const detectedName = nameFromSlug(slug, applicantName);
  const current = isCurrent(kind, year, month);

  return {
    id: fileName,
    fileName,
    kind,
    kindLabel: KIND_LABEL[kind],
    detectedName,
    periodLabel: periodLabel(kind, year, month),
    nameMatch: namesEqual(detectedName, applicantName),
    recency: current ? "current" : "stale",
    recencyLabel: recencyLabel(kind, current),
  };
}

export function buildDocCheckReport(
  files: { name: string; docType?: DocumentType }[],
  applicantName: string,
  extras: DocCheckRow[] = [],
): DocCheckReport {
  const rows = [
    ...files
      .map((file) => checkIncomeFile(file.name, applicantName, file.docType))
      .filter((row): row is DocCheckRow => Boolean(row)),
    ...extras,
  ];
  const namePass = rows.every((row) => row.nameMatch);
  const recencyPass = rows.every((row) => row.recency === "current");
  return {
    rows,
    passed: namePass && recencyPass && rows.length > 0,
    namePass,
    recencyPass,
    checkedCount: rows.length,
  };
}

export function checkApplyState(state: ApplyState, extras: DocCheckRow[] = []): DocCheckReport {
  const applicantName = `${state.personal.firstName} ${state.personal.lastName}`.trim() || "Jane Doe";
  const files: { name: string; docType?: DocumentType }[] = [
    ...state.paystubs.map((file) => ({ name: file.name, docType: "paystub" as const })),
    ...state.statements.map((file) => ({ name: file.name, docType: "bank_statement" as const })),
  ];
  return buildDocCheckReport(files, applicantName, extras);
}

export function checkApplicationDetails(
  details: ApplicationDetails | undefined,
  applicantName: string,
  extras: DocCheckRow[] = [],
): DocCheckReport {
  return buildDocCheckReport(details?.documents ?? [], applicantName, extras);
}
