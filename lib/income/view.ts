import type { DocCheckRow, DocCheckReport, IncomeDocKind as FilenameKind } from "@/lib/docs/ai-check";
import type { IncomeCheckRow } from "@/lib/db/schema";
import type { LiveIncomeCheckSummary } from "@/lib/data/mock-data";
import type { IncomeCheckStatus, IncomeDocKind, Recency } from "@/lib/income/extract";

const KIND_LABEL: Record<string, string> = {
  paystub: "Pay stub",
  bank_statement: "Bank statement",
  w2: "W-2",
  form_1099: "1099",
  other: "Proof of income",
};

export type PublicIncomeCheck = {
  id: string;
  applicationId: string | null;
  listingId: string | null;
  applicantName: string;
  docKind: IncomeDocKind | string;
  fileName: string;
  status: IncomeCheckStatus | string;
  errorText: string | null;
  monthlyGrossCents: number | null;
  payFrequency: string | null;
  employer: string | null;
  periodStart: string | null;
  periodEnd: string | null;
  detectedName: string | null;
  nameMatch: boolean | null;
  recency: Recency | string | null;
  recencyLabel: string | null;
  extractor: string | null;
  createdAt: string;
  updatedAt: string;
};

/** Landlord / apply UI — never a blob path or raw model dump. */
export function toPublicIncomeCheck(row: IncomeCheckRow): PublicIncomeCheck {
  return {
    id: row.id,
    applicationId: row.applicationId,
    listingId: row.listingId,
    applicantName: row.applicantName,
    docKind: row.docKind,
    fileName: row.fileName,
    status: row.status,
    errorText: row.errorText,
    monthlyGrossCents: row.monthlyGrossCents,
    payFrequency: row.payFrequency,
    employer: row.employer,
    periodStart: row.periodStart,
    periodEnd: row.periodEnd,
    detectedName: row.detectedName,
    nameMatch: row.nameMatch,
    recency: row.recency,
    recencyLabel: row.recencyLabel,
    extractor: row.extractor,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function incomeCheckToDocRow(row: PublicIncomeCheck): DocCheckRow {
  const kind = (
    row.docKind === "other" ? "other_income" : KIND_LABEL[row.docKind] ? row.docKind : "other_income"
  ) as FilenameKind;
  const periodLabel =
    row.recencyLabel ||
    (row.periodStart && row.periodEnd
      ? `${row.periodStart} – ${row.periodEnd}`
      : row.periodEnd || row.periodStart || "Date not read");

  return {
    id: row.id,
    fileName: row.fileName,
    kind,
    kindLabel: KIND_LABEL[row.docKind] ?? "Proof of income",
    detectedName: row.detectedName || "Name not read",
    periodLabel,
    nameMatch: Boolean(row.nameMatch),
    recency: row.recency === "current" ? "current" : "stale",
    recencyLabel: row.recencyLabel || (row.status === "ready" ? "Read from your upload" : row.status),
    extra: false,
    source: "live",
    status: row.status,
    monthlyGrossCents: row.monthlyGrossCents,
    employer: row.employer,
    waiting: row.status === "pending" || row.status === "claimed",
    errored: row.status === "error",
    readLabel: "Read from your upload",
  };
}

export function reportFromIncomeChecks(rows: PublicIncomeCheck[]): DocCheckReport {
  const mapped = rows.map(incomeCheckToDocRow);
  const ready = rows.filter((row) => row.status === "ready");
  const namePass = ready.length > 0 && ready.every((row) => row.nameMatch);
  const recencyPass = ready.length > 0 && ready.every((row) => row.recency === "current");
  return {
    rows: mapped,
    passed: namePass && recencyPass,
    namePass,
    recencyPass,
    checkedCount: rows.length,
    live: true,
    waiting: rows.some((row) => row.status === "pending" || row.status === "claimed"),
  };
}

export function summarizePublicChecks(
  rows: PublicIncomeCheck[],
): LiveIncomeCheckSummary | undefined {
  if (!rows.length) return undefined;
  const ready = rows.filter((row) => row.status === "ready");
  const errored = rows.some((row) => row.status === "error");
  const claimed = rows.some((row) => row.status === "claimed");
  const pending = rows.some((row) => row.status === "pending");
  const status: LiveIncomeCheckSummary["status"] = ready.length
    ? "ready"
    : errored && !pending && !claimed
      ? "error"
      : claimed
        ? "claimed"
        : "pending";

  const monthlyGrossCents = ready.reduce<number | null>((best, row) => {
    if (row.monthlyGrossCents == null) return best;
    if (best == null) return row.monthlyGrossCents;
    return Math.max(best, row.monthlyGrossCents);
  }, null);

  const latestReady = [...ready].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  )[0];

  return {
    status,
    monthlyGross: monthlyGrossCents != null ? Math.round(monthlyGrossCents / 100) : null,
    monthlyGrossCents,
    nameMatch: latestReady?.nameMatch ?? null,
    recency: (latestReady?.recency as LiveIncomeCheckSummary["recency"]) ?? null,
    recencyLabel: latestReady?.recencyLabel ?? null,
    employer: latestReady?.employer ?? null,
    readyCount: ready.length,
    checkCount: rows.length,
  };
}

export function summarizeIncomeChecks(rows: IncomeCheckRow[]): LiveIncomeCheckSummary | undefined {
  if (!rows.length) return undefined;
  const ready = rows.filter((row) => row.status === "ready");
  const errored = rows.some((row) => row.status === "error");
  const claimed = rows.some((row) => row.status === "claimed");
  const pending = rows.some((row) => row.status === "pending");
  const status: LiveIncomeCheckSummary["status"] = ready.length
    ? "ready"
    : errored && !pending && !claimed
      ? "error"
      : claimed
        ? "claimed"
        : "pending";

  const monthlyGrossCents = ready.reduce<number | null>((best, row) => {
    if (row.monthlyGrossCents == null) return best;
    if (best == null) return row.monthlyGrossCents;
    return Math.max(best, row.monthlyGrossCents);
  }, null);

  const latestReady = [...ready].sort(
    (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime(),
  )[0];

  return {
    status,
    monthlyGross: monthlyGrossCents != null ? Math.round(monthlyGrossCents / 100) : null,
    monthlyGrossCents,
    nameMatch: latestReady?.nameMatch ?? null,
    recency: (latestReady?.recency as LiveIncomeCheckSummary["recency"]) ?? null,
    recencyLabel: latestReady?.recencyLabel ?? null,
    employer: latestReady?.employer ?? null,
    readyCount: ready.length,
    checkCount: rows.length,
  };
}

export function householdGrossCents(rows: IncomeCheckRow[]): number {
  const byApplicant = new Map<string, number>();
  for (const row of rows) {
    if (row.status !== "ready" || row.monthlyGrossCents == null) continue;
    const key = row.applicationId || row.applicantName || row.id;
    const current = byApplicant.get(key) ?? 0;
    byApplicant.set(key, Math.max(current, row.monthlyGrossCents));
  }
  return [...byApplicant.values()].reduce((sum, value) => sum + value, 0);
}
