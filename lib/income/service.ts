import "server-only";

import { and, desc, eq, inArray } from "drizzle-orm";
import { neon } from "@neondatabase/serverless";
import { getDb } from "@/lib/db/client";
import { incomeChecks, type IncomeCheckRow } from "@/lib/db/schema";
import { newId } from "@/lib/ids";
import { databaseEnabled } from "@/lib/config/env";
import {
  isIncomeDocKind,
  monthlyGrossFromFrequency,
  namesMatch,
  parseModelOutput,
  recencyFromPeriod,
  type IncomeDocKind,
  type PayFrequency,
} from "@/lib/income/extract";
import { summarizeIncomeChecks, toPublicIncomeCheck } from "@/lib/income/view";
import type { LiveIncomeCheckSummary } from "@/lib/data/mock-data";

export type EnqueueInput = {
  applicationId?: string | null;
  listingId?: string | null;
  documentId?: string | null;
  applicantName: string;
  docKind: string;
  blobPath: string;
  fileName: string;
};

export function incomeQueueAvailable(): boolean {
  return databaseEnabled();
}

export async function enqueueIncomeCheck(input: EnqueueInput): Promise<IncomeCheckRow> {
  const database = getDb();
  if (!database) throw new Error("DATABASE_URL is not set");
  if (!isIncomeDocKind(input.docKind)) throw new Error("Unknown document type.");
  if (!input.blobPath.startsWith("applications/")) throw new Error("Unknown document.");

  const now = new Date();
  const row = {
    id: newId("chk"),
    applicationId: input.applicationId || null,
    listingId: input.listingId || null,
    documentId: input.documentId || null,
    applicantName: input.applicantName.trim(),
    docKind: input.docKind,
    blobPath: input.blobPath,
    fileName: input.fileName,
    status: "pending",
    createdAt: now,
    updatedAt: now,
  };

  const [created] = await database.insert(incomeChecks).values(row).returning();
  if (!created) throw new Error("Could not enqueue that income check.");
  return created;
}

export async function getIncomeChecksByIds(ids: string[]): Promise<IncomeCheckRow[]> {
  const database = getDb();
  if (!database || !ids.length) return [];
  return database.select().from(incomeChecks).where(inArray(incomeChecks.id, ids));
}

export async function getIncomeChecksByApplication(
  applicationId: string,
): Promise<IncomeCheckRow[]> {
  const database = getDb();
  if (!database) return [];
  return database
    .select()
    .from(incomeChecks)
    .where(eq(incomeChecks.applicationId, applicationId))
    .orderBy(desc(incomeChecks.createdAt));
}

export async function getIncomeChecksByListing(listingId: string): Promise<IncomeCheckRow[]> {
  const database = getDb();
  if (!database) return [];
  return database
    .select()
    .from(incomeChecks)
    .where(eq(incomeChecks.listingId, listingId))
    .orderBy(desc(incomeChecks.createdAt));
}

export async function getIncomeChecksForApplications(
  applicationIds: string[],
): Promise<IncomeCheckRow[]> {
  const database = getDb();
  if (!database || !applicationIds.length) return [];
  return database
    .select()
    .from(incomeChecks)
    .where(inArray(incomeChecks.applicationId, applicationIds));
}

export async function summariesByApplication(
  applicationIds: string[],
): Promise<Map<string, LiveIncomeCheckSummary>> {
  const rows = await getIncomeChecksForApplications(applicationIds);
  const grouped = new Map<string, IncomeCheckRow[]>();
  for (const row of rows) {
    if (!row.applicationId) continue;
    const list = grouped.get(row.applicationId) ?? [];
    list.push(row);
    grouped.set(row.applicationId, list);
  }
  const out = new Map<string, LiveIncomeCheckSummary>();
  for (const [id, list] of grouped) {
    const summary = summarizeIncomeChecks(list);
    if (summary) out.set(id, summary);
  }
  return out;
}

export async function attachChecksToApplication(
  applicationId: string,
  listingId: string | null,
  checkIds: string[],
): Promise<void> {
  const database = getDb();
  if (!database || !checkIds.length) return;
  await database
    .update(incomeChecks)
    .set({ applicationId, listingId: listingId || undefined, updatedAt: new Date() })
    .where(and(inArray(incomeChecks.id, checkIds)));
}

export async function getIncomeCheck(id: string): Promise<IncomeCheckRow | undefined> {
  const database = getDb();
  if (!database) return undefined;
  const [row] = await database
    .select()
    .from(incomeChecks)
    .where(eq(incomeChecks.id, id))
    .limit(1);
  return row;
}

/**
 * Atomically claim one pending row. SKIP LOCKED so two Studio workers cannot
 * take the same job. Single statement — Neon HTTP does not run multi-query
 * transactions.
 */
export async function claimNextIncomeCheck(
  claimedBy: string,
): Promise<IncomeCheckRow | null> {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");

  const sqlClient = neon(url);
  const rows = (await sqlClient`
    UPDATE income_checks AS ic
    SET
      status = 'claimed',
      claimed_at = NOW(),
      claimed_by = ${claimedBy},
      updated_at = NOW()
    WHERE ic.id = (
      SELECT id FROM income_checks
      WHERE status = 'pending'
      ORDER BY created_at ASC
      FOR UPDATE SKIP LOCKED
      LIMIT 1
    )
    RETURNING *
  `) as IncomeCheckRow[];

  return rows[0] ?? null;
}

export type CompleteInput = {
  id: string;
  status: "ready" | "error";
  errorText?: string | null;
  extractor?: string | null;
  rawText?: string | null;
  rawJson?: Record<string, unknown> | null;
  detectedName?: string | null;
  employer?: string | null;
  payFrequency?: string | null;
  periodStart?: string | null;
  periodEnd?: string | null;
  grossThisPeriodCents?: number | null;
  ytdGrossCents?: number | null;
  monthlyGrossCents?: number | null;
  recencyCurrent?: boolean | null;
};

export async function completeIncomeCheck(input: CompleteInput): Promise<IncomeCheckRow> {
  const database = getDb();
  if (!database) throw new Error("DATABASE_URL is not set");

  const existing = await getIncomeCheck(input.id);
  if (!existing) throw new Error("Income check not found.");

  const now = new Date();

  if (input.status === "error") {
    const [updated] = await database
      .update(incomeChecks)
      .set({
        status: "error",
        errorText: input.errorText?.trim() || "income check failed",
        extractor: input.extractor ?? existing.extractor,
        rawJson: input.rawJson ?? existing.rawJson,
        updatedAt: now,
      })
      .where(eq(incomeChecks.id, existing.id))
      .returning();
    if (!updated) throw new Error("Could not write that income check.");
    return updated;
  }

  let parsed = input.rawText ? parseModelOutput(input.rawText) : null;
  if (input.rawJson && !parsed?.ok) {
    parsed = parseModelOutput(JSON.stringify(input.rawJson));
  }

  if (input.rawText && parsed && !parsed.ok) {
    const [updated] = await database
      .update(incomeChecks)
      .set({
        status: "error",
        errorText: parsed.error,
        extractor: input.extractor ?? existing.extractor,
        rawJson: { rawText: input.rawText },
        updatedAt: now,
      })
      .where(eq(incomeChecks.id, existing.id))
      .returning();
    if (!updated) throw new Error("Could not write that income check.");
    return updated;
  }

  const extracted = parsed?.ok ? parsed.value : null;
  const payFrequency = (extracted?.payFrequency ||
    input.payFrequency ||
    "unknown") as PayFrequency;
  const monthlyGrossCents = monthlyGrossFromFrequency(
    extracted?.grossThisPeriodCents ?? input.grossThisPeriodCents ?? null,
    payFrequency,
    extracted?.monthlyGrossCents ?? input.monthlyGrossCents ?? null,
  );
  const detectedName = extracted?.detectedName ?? input.detectedName ?? null;
  const periodStart = extracted?.periodStart ?? input.periodStart ?? null;
  const periodEnd = extracted?.periodEnd ?? input.periodEnd ?? null;
  const recency = recencyFromPeriod(
    {
      kind: existing.docKind as IncomeDocKind,
      periodStart,
      periodEnd,
      recencyCurrent: extracted?.recencyCurrent ?? input.recencyCurrent,
    },
    now,
  );

  const [updated] = await database
    .update(incomeChecks)
    .set({
      status: "ready",
      errorText: null,
      monthlyGrossCents,
      payFrequency,
      employer: extracted?.employer ?? input.employer ?? null,
      periodStart,
      periodEnd,
      detectedName,
      nameMatch: namesMatch(detectedName, existing.applicantName),
      recency: recency.recency,
      recencyLabel: recency.recencyLabel,
      extractor: input.extractor ?? existing.extractor,
      rawJson: extracted
        ? parsed && parsed.ok
          ? parsed.raw
          : input.rawJson
        : input.rawJson ?? null,
      updatedAt: now,
    })
    .where(eq(incomeChecks.id, existing.id))
    .returning();

  if (!updated) throw new Error("Could not write that income check.");
  return updated;
}

export function publicChecks(rows: IncomeCheckRow[]) {
  return rows.map(toPublicIncomeCheck);
}
