/**
 * Pure AI Income Check helpers. Used by the complete route and unit tests.
 * Recency is always measured from the clock you pass in — never a hardcoded
 * “today” like 2026-08-14.
 */

export const INCOME_DOC_KINDS = [
  "paystub",
  "bank_statement",
  "w2",
  "form_1099",
  "other",
] as const;

export type IncomeDocKind = (typeof INCOME_DOC_KINDS)[number];

export const PAY_FREQUENCIES = [
  "weekly",
  "biweekly",
  "semimonthly",
  "monthly",
  "unknown",
] as const;

export type PayFrequency = (typeof PAY_FREQUENCIES)[number];

export const INCOME_CHECK_STATUSES = ["pending", "claimed", "ready", "error"] as const;
export type IncomeCheckStatus = (typeof INCOME_CHECK_STATUSES)[number];

export const RECENCY_VALUES = ["current", "stale", "unknown"] as const;
export type Recency = (typeof RECENCY_VALUES)[number];

export type ExtractedIncome = {
  detectedName: string | null;
  employer: string | null;
  payFrequency: PayFrequency;
  periodStart: string | null;
  periodEnd: string | null;
  grossThisPeriodCents: number | null;
  ytdGrossCents: number | null;
  monthlyGrossCents: number | null;
  recencyCurrent: boolean | null;
  notes: string | null;
};

export type ParseOk = { ok: true; value: ExtractedIncome; raw: Record<string, unknown> };
export type ParseErr = { ok: false; error: string; rawText: string };
export type ParseResult = ParseOk | ParseErr;

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

export function isIncomeDocKind(value: string): value is IncomeDocKind {
  return (INCOME_DOC_KINDS as readonly string[]).includes(value);
}

export function isPayFrequency(value: string): value is PayFrequency {
  return (PAY_FREQUENCIES as readonly string[]).includes(value);
}

export function isIncomeCheckStatus(value: string): value is IncomeCheckStatus {
  return (INCOME_CHECK_STATUSES as readonly string[]).includes(value);
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function readString(record: Record<string, unknown>, ...keys: string[]): string | null {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed) return trimmed;
    }
  }
  return null;
}

function readNumber(record: Record<string, unknown>, ...keys: string[]): number | null {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number" && Number.isFinite(value)) return Math.round(value);
    if (typeof value === "string" && value.trim()) {
      const parsed = Number(value.replace(/[^0-9.-]/g, ""));
      if (Number.isFinite(parsed)) return Math.round(parsed);
    }
  }
  return null;
}

function readBool(record: Record<string, unknown>, ...keys: string[]): boolean | null {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "boolean") return value;
  }
  return null;
}

function normalizeFrequency(value: string | null): PayFrequency {
  if (!value) return "unknown";
  const slug = value.toLowerCase().replace(/[\s_-]+/g, "");
  if (slug === "weekly" || slug === "week") return "weekly";
  if (slug === "biweekly" || slug === "fortnightly" || slug === "every2weeks") return "biweekly";
  if (slug === "semimonthly" || slug === "bimonthly" || slug === "twiceamonth") return "semimonthly";
  if (slug === "monthly" || slug === "month") return "monthly";
  if (isPayFrequency(value.toLowerCase())) return value.toLowerCase() as PayFrequency;
  return "unknown";
}

/** Annualize a single pay-period gross from the printed frequency. */
export function monthlyGrossFromFrequency(
  grossThisPeriodCents: number | null,
  frequency: PayFrequency,
  fallbackMonthlyCents: number | null = null,
): number | null {
  if (grossThisPeriodCents != null && Number.isFinite(grossThisPeriodCents)) {
    switch (frequency) {
      case "weekly":
        return Math.round((grossThisPeriodCents * 52) / 12);
      case "biweekly":
        return Math.round((grossThisPeriodCents * 26) / 12);
      case "semimonthly":
        return grossThisPeriodCents * 2;
      case "monthly":
        return grossThisPeriodCents;
      case "unknown":
        break;
    }
  }
  if (fallbackMonthlyCents != null && Number.isFinite(fallbackMonthlyCents)) {
    return Math.round(fallbackMonthlyCents);
  }
  return null;
}

function parseIsoDate(value: string | null): Date | null {
  if (!value) return null;
  const match = value.trim().match(/^(\d{4})-(\d{2})(?:-(\d{2}))?/);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = match[3] ? Number(match[3]) : 1;
  if (!year || month < 1 || month > 12) return null;
  return new Date(Date.UTC(year, month - 1, day));
}

function isAnnualKind(kind: IncomeDocKind): boolean {
  return kind === "w2" || kind === "form_1099";
}

/**
 * Current = overlaps the last two calendar months measured from `today`
 * (this month and the previous month). W-2 / 1099 use the last completed
 * tax year (today’s year − 1) or the current year.
 */
export function recencyFromPeriod(
  input: {
    kind: IncomeDocKind;
    periodStart?: string | null;
    periodEnd?: string | null;
    recencyCurrent?: boolean | null;
  },
  today: Date = new Date(),
): { recency: Recency; recencyLabel: string } {
  if (isAnnualKind(input.kind)) {
    const year =
      parseIsoDate(input.periodEnd ?? input.periodStart)?.getUTCFullYear() ??
      (input.periodEnd || input.periodStart || "").match(/^(20\d{2})/)?.[1];
    const taxYear = typeof year === "string" ? Number(year) : year;
    const currentYear = today.getUTCFullYear();
    const current = taxYear === currentYear || taxYear === currentYear - 1;
    if (!taxYear) {
      return { recency: "unknown", recencyLabel: "Date not read" };
    }
    return {
      recency: current ? "current" : "stale",
      recencyLabel: current ? `Current (tax year ${taxYear})` : `Stale (tax year ${taxYear})`,
    };
  }

  const start = parseIsoDate(input.periodStart ?? null);
  const end = parseIsoDate(input.periodEnd ?? null);
  const doc = end ?? start;
  if (!doc) {
    if (input.recencyCurrent === true) {
      return { recency: "current", recencyLabel: "Current (2 mo)" };
    }
    if (input.recencyCurrent === false) {
      return { recency: "stale", recencyLabel: "Stale" };
    }
    return { recency: "unknown", recencyLabel: "Date not read" };
  }

  const windowStart = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - 1, 1));
  const windowEnd = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 1, 1));
  const current = doc >= windowStart && doc < windowEnd;
  const monthLabel = `${MONTH_NAMES[doc.getUTCMonth()]} ${doc.getUTCFullYear()}`;
  return {
    recency: current ? "current" : "stale",
    recencyLabel: current ? `Current · ${monthLabel}` : `Stale · ${monthLabel}`,
  };
}

function normalizeName(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ");
}

/** Exact normalized match, or both first and last tokens appear in the detected name. */
export function namesMatch(
  detectedName: string | null | undefined,
  applicantName: string | null | undefined,
): boolean {
  if (!detectedName?.trim() || !applicantName?.trim()) return false;
  const detected = normalizeName(detectedName);
  const applicant = normalizeName(applicantName);
  if (!detected || !applicant) return false;
  if (detected === applicant) return true;
  const tokens = applicant.split(" ").filter((token) => token.length > 1);
  if (tokens.length < 2) return detected === applicant;
  return tokens.every((token) => detected.includes(token));
}

function stripCodeFence(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  return (fenced?.[1] ?? text).trim();
}

function firstJsonObject(text: string): string | null {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  return text.slice(start, end + 1);
}

/**
 * Parse model chat output. Malformed JSON, arrays, or empty objects with no
 * usable fields become an error — we never invent a name or amount.
 */
export function parseModelOutput(text: string): ParseResult {
  const rawText = String(text ?? "");
  const stripped = stripCodeFence(rawText);
  const candidate = firstJsonObject(stripped) ?? stripped;
  let parsed: unknown;
  try {
    parsed = JSON.parse(candidate);
  } catch {
    return { ok: false, error: "malformed model output", rawText };
  }

  const record = asRecord(parsed);
  if (!record) {
    return { ok: false, error: "malformed model output", rawText };
  }

  const detectedName = readString(record, "detected_name", "detectedName");
  const employer = readString(record, "employer");
  const payFrequency = normalizeFrequency(readString(record, "pay_frequency", "payFrequency"));
  const periodStart = readString(record, "period_start", "periodStart");
  const periodEnd = readString(record, "period_end", "periodEnd");
  const grossThisPeriodCents = readNumber(
    record,
    "gross_this_period_cents",
    "grossThisPeriodCents",
  );
  const ytdGrossCents = readNumber(record, "ytd_gross_cents", "ytdGrossCents");
  const modelMonthly = readNumber(record, "monthly_gross_cents", "monthlyGrossCents");
  const monthlyGrossCents = monthlyGrossFromFrequency(
    grossThisPeriodCents,
    payFrequency,
    modelMonthly,
  );
  const recencyCurrent = readBool(record, "recency_current", "recencyCurrent");
  const notes = readString(record, "notes");

  const value: ExtractedIncome = {
    detectedName,
    employer,
    payFrequency,
    periodStart,
    periodEnd,
    grossThisPeriodCents,
    ytdGrossCents,
    monthlyGrossCents,
    recencyCurrent,
    notes,
  };

  return { ok: true, value, raw: record };
}

export function extractionPrompt(todayIsoDate: string): string {
  return [
    "Extract JSON only. No prose, no markdown.",
    "Schema:",
    "{",
    '  "detected_name": string | null,',
    '  "employer": string | null,',
    '  "pay_frequency": "weekly" | "biweekly" | "semimonthly" | "monthly" | "unknown",',
    '  "period_start": "YYYY-MM-DD" | null,',
    '  "period_end": "YYYY-MM-DD" | null,',
    '  "gross_this_period_cents": number | null,',
    '  "ytd_gross_cents": number | null,',
    '  "monthly_gross_cents": number | null,',
    '  "recency_current": boolean | null,',
    '  "notes": string | null',
    "}",
    `TODAY is ${todayIsoDate} (UTC). recency_current is true only if the document period falls in the last two calendar months from TODAY.`,
    "Compute monthly_gross_cents from pay_frequency: weekly ×52/12, biweekly ×26/12, semimonthly ×2, monthly ×1.",
    "Never invent a name or amount. Use null if unreadable.",
  ].join("\n");
}

export function utcTodayIsoDate(today: Date = new Date()): string {
  return today.toISOString().slice(0, 10);
}
