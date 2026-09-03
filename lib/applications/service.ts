import "server-only";

import { and, desc, eq, inArray } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import {
  applications,
  consents,
  creditShares,
  documents,
  households,
  listings,
  payments,
  type ApplicationRow,
} from "@/lib/db/schema";
import { newConfirmationId, newId } from "@/lib/ids";
import { toStoredPacket, type StoredPacket } from "@/lib/apply/sanitize";
import type { ApplyState } from "@/lib/apply/types";
import type { Applicant } from "@/lib/data/mock-data";
import { CONSENT_KIND, FCRA_PACK_VERSION } from "@/lib/legal/fcra";
import { experianConnect } from "@/lib/screening/experian-connect";
import { getLatestCreditConsent } from "@/lib/screening/credit-consent";
import { STANDARD_SCREENING_FEE_CENTS } from "@/lib/payments/pricing";

export type SubmitContext = {
  applicantUserId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  returnUrl: string;
};

export type SubmittedApplication = {
  id: string;
  confirmationId: string;
  status: string;
};

/**
 * Writes the packet, its consents, its documents, and an authorized (but not yet
 * requested) credit share. The application lands in `awaiting_payment`: under
 * charge-then-screen nothing is asked of Experian until Stripe confirms the fee.
 */
export async function submitApplication(
  state: ApplyState,
  context: SubmitContext
): Promise<SubmittedApplication> {
  const database = getDb();
  if (!database) throw new Error("DATABASE_URL is not set");

  const [listing] = await database
    .select()
    .from(listings)
    .where(eq(listings.id, state.listingId))
    .limit(1);
  if (!listing) throw new Error("Listing not found");

  const now = new Date();
  const packet = toStoredPacket(state);
  const householdId = await ensureHousehold(state, listing.id);

  let applicationId = state.applicationId;
  let confirmationId = state.confirmationId;

  if (applicationId) {
    const [existing] = await database
      .select()
      .from(applications)
      .where(eq(applications.id, applicationId))
      .limit(1);
    if (existing) {
      confirmationId = existing.confirmationId;
      await database
        .update(applications)
        .set({
          householdId,
          applicantUserId: context.applicantUserId ?? existing.applicantUserId,
          firstName: state.personal.firstName,
          lastName: state.personal.lastName,
          email: state.personal.email,
          phone: state.personal.phone,
          status: "awaiting_payment",
          screeningPackage: state.screeningPackage,
          packet: packet as unknown as Record<string, unknown>,
          submittedAt: existing.submittedAt ?? now,
          updatedAt: now,
        })
        .where(eq(applications.id, existing.id));
    } else {
      applicationId = undefined;
    }
  }

  if (!applicationId) {
    applicationId = newId("app");
    confirmationId = newConfirmationId();
    await database.insert(applications).values({
      id: applicationId,
      confirmationId,
      listingId: listing.id,
      householdId,
      applicantUserId: context.applicantUserId,
      firstName: state.personal.firstName,
      lastName: state.personal.lastName,
      email: state.personal.email,
      phone: state.personal.phone,
      status: "awaiting_payment",
      screeningPackage: state.screeningPackage,
      packet: packet as unknown as Record<string, unknown>,
      submittedAt: now,
    });
  }

  await writeConsents(applicationId, state, context, now);
  await writeDocuments(applicationId, state);
  await authorizeCreditShare(applicationId, state, listing.ownerId ?? listing.id, context);

  await database.insert(payments).values({
    id: newId("pay"),
    applicationId,
    provider: "stripe",
    amountCents: STANDARD_SCREENING_FEE_CENTS,
    currency: "usd",
    status: "pending",
  });

  return { id: applicationId, confirmationId: confirmationId ?? newConfirmationId(), status: "awaiting_payment" };
}

/** People applying together share a household scoped to the listing. */
async function ensureHousehold(state: ApplyState, listingId: string): Promise<string | null> {
  const database = getDb();
  if (!database) return null;
  if (!state.household.occupants.length) return null;

  const householdId = newId("hh");
  const names = [
    `${state.personal.firstName} ${state.personal.lastName}`.trim(),
    ...state.household.occupants.map((row) => row.name.trim()).filter(Boolean),
  ];

  await database.insert(households).values({
    id: householdId,
    listingId,
    label: names.join(" + "),
  });

  return householdId;
}

async function writeConsents(
  applicationId: string,
  state: ApplyState,
  context: SubmitContext,
  now: Date
): Promise<void> {
  const database = getDb();
  if (!database) return;

  const base = {
    applicationId,
    version: FCRA_PACK_VERSION,
    signature: state.consent.typedFullName || state.consent.signature,
    ipAddress: context.ipAddress,
    userAgent: context.userAgent,
    acceptedAt: now,
  };

  const [already] = await database
    .select({ id: consents.id })
    .from(consents)
    .where(eq(consents.applicationId, applicationId))
    .limit(1);
  if (already) return;

  const granted = state.consent.checkboxAuth && state.consent.checkboxUse;
  const rows: (typeof consents.$inferInsert)[] = [
    { id: newId("con"), kind: CONSENT_KIND.fcraCredit, granted, ...base },
  ];

  if (state.experian.status === "authorized" || state.experian.status === "connected") {
    rows.push({
      id: newId("con"),
      kind: CONSENT_KIND.experianConnect,
      granted: true,
      ...base,
    });
  }

  await database.insert(consents).values(rows);
}

/** Only files that made it to Blob storage are recorded — a local-only preview is not a document. */
async function writeDocuments(applicationId: string, state: ApplyState): Promise<void> {
  const database = getDb();
  if (!database) return;

  const entries = [
    ...(state.idFront ? [{ file: state.idFront, kind: "photo_id_front" }] : []),
    ...(state.idBack ? [{ file: state.idBack, kind: "photo_id_back" }] : []),
    ...state.paystubs.map((file) => ({ file, kind: "paystub" })),
    ...state.statements.map((file) => ({ file, kind: "bank_statement" })),
  ].filter((entry) => Boolean(entry.file.storedUrl));

  if (!entries.length) return;

  await database.insert(documents).values(
    entries.map((entry) => ({
      id: newId("doc"),
      applicationId,
      kind: entry.kind,
      filename: entry.file.name,
      mime: entry.file.mime,
      size: entry.file.size,
      blobUrl: entry.file.storedUrl!,
      blobPathname: entry.file.pathname ?? null,
    }))
  );
}

/**
 * Records the applicant's permission with Experian Connect. The share is only
 * authorized here — `runCreditShare` requests it once payment clears.
 */
async function authorizeCreditShare(
  applicationId: string,
  state: ApplyState,
  recipientReference: string,
  context: SubmitContext
): Promise<void> {
  const database = getDb();
  if (!database) return;
  if (state.experian.status !== "authorized" && state.experian.status !== "connected") return;

  const [existingShare] = await database
    .select()
    .from(creditShares)
    .where(eq(creditShares.applicationId, applicationId))
    .limit(1);
  if (existingShare) return;

  const archived = await getLatestCreditConsent(applicationId);
  if (!archived && !state.consent.consentId) {
    throw new Error("Credit consent must be archived before an Experian share can start.");
  }

  let shareReference = state.experian.shareReference ?? archived?.experianShareId ?? null;
  let expiresAt: Date | undefined;

  if (!shareReference) {
    const authorization = await experianConnect().authorize({
      applicationId,
      returnUrl: context.returnUrl,
      recipientReference,
      applicant: {
        firstName: state.personal.firstName,
        lastName: state.personal.lastName,
        email: state.personal.email,
      },
    });
    shareReference = authorization.shareReference;
    expiresAt = authorization.expiresAt;
  }

  await database.insert(creditShares).values({
    id: newId("crs"),
    applicationId,
    provider: "experian_connect",
    status: "awaiting_payment",
    shareReference,
    inquiryType: "soft",
    authorizedAt: new Date(),
    expiresAt,
  });
}

/**
 * Charge-then-screen, second half: called from the Stripe webhook once the fee
 * is captured. Only now does anything reach the vendor.
 */
export async function runCreditShare(applicationId: string): Promise<void> {
  const database = getDb();
  if (!database) return;

  const [share] = await database
    .select()
    .from(creditShares)
    .where(eq(creditShares.applicationId, applicationId))
    .limit(1);

  if (!share?.shareReference) return;
  if (share.status === "shared") return;

  await database
    .update(creditShares)
    .set({ status: "requested", requestedAt: new Date() })
    .where(eq(creditShares.id, share.id));

  const result = await experianConnect().requestShare(share.shareReference);

  if (result.status === "shared") {
    await database
      .update(creditShares)
      .set({
        status: "shared",
        sharedAt: result.sharedAt,
        score: result.summary.score,
        scoreModel: result.summary.scoreModel,
        summary: result.summary as unknown as Record<string, unknown>,
      })
      .where(eq(creditShares.id, share.id));

    await database
      .update(applications)
      .set({ status: "completed", leaseScore: result.summary.score, updatedAt: new Date() })
      .where(eq(applications.id, applicationId));
    return;
  }

  if (result.status === "failed") {
    await database
      .update(creditShares)
      .set({ status: "failed", failureReason: result.reason })
      .where(eq(creditShares.id, share.id));
    return;
  }

  // Pending: the live Connect client will complete this out of band.
  await database
    .update(applications)
    .set({ status: "screening", updatedAt: new Date() })
    .where(eq(applications.id, applicationId));
}

/** Marks the fee captured and releases the credit share. Idempotent per session. */
export async function markPaid(
  checkoutSessionId: string,
  paymentIntentId: string | null
): Promise<string | null> {
  const database = getDb();
  if (!database) return null;

  const [payment] = await database
    .select()
    .from(payments)
    .where(eq(payments.stripeCheckoutSessionId, checkoutSessionId))
    .limit(1);

  if (!payment) return null;
  if (payment.status === "paid") return payment.applicationId;

  await database
    .update(payments)
    .set({ status: "paid", paidAt: new Date(), stripePaymentIntentId: paymentIntentId })
    .where(eq(payments.id, payment.id));

  await database
    .update(applications)
    .set({ status: "paid", updatedAt: new Date() })
    .where(eq(applications.id, payment.applicationId));

  await runCreditShare(payment.applicationId);

  return payment.applicationId;
}

export async function attachCheckoutSession(
  applicationId: string,
  checkoutSessionId: string
): Promise<void> {
  const database = getDb();
  if (!database) return;

  await database
    .update(payments)
    .set({ stripeCheckoutSessionId: checkoutSessionId })
    .where(eq(payments.applicationId, applicationId));
}

/** Demo fallback when Stripe is unconfigured: no charge, but the flow completes. */
export async function markDemoPaid(applicationId: string): Promise<void> {
  const database = getDb();
  if (!database) return;

  await database
    .update(payments)
    .set({ status: "paid", paidAt: new Date(), provider: "demo" })
    .where(eq(payments.applicationId, applicationId));

  await database
    .update(applications)
    .set({ status: "paid", updatedAt: new Date() })
    .where(eq(applications.id, applicationId));

  await runCreditShare(applicationId);
}

const DESK_VISIBLE_STATUSES = ["paid", "screening", "completed", "approved", "declined"];

function toApplicant(row: ApplicationRow): Applicant {
  const status =
    row.status === "approved" || row.status === "declined"
      ? row.status
      : row.status === "completed"
        ? "completed"
        : "in_progress";

  return {
    id: row.id,
    propertyId: row.listingId,
    status,
    firstName: row.firstName,
    lastName: row.lastName,
    email: row.email,
    phone: row.phone ?? "",
    appliedAt: (row.submittedAt ?? row.createdAt).toISOString(),
    completedAt: row.status === "completed" ? row.updatedAt.toISOString() : undefined,
    leaseScore: row.leaseScore ?? undefined,
    householdId: row.householdId ?? undefined,
  };
}

/**
 * Desk queue for one landlord. Unpaid drafts are hidden — the pipeline should
 * only show applications the renter actually completed and paid for.
 *
 * `ownerId` is required and always constrains the listing lookup: a caller
 * cannot widen the query by omitting it, and a supplied `listingId` is
 * intersected with the listings this landlord owns rather than trusted.
 */
export async function listDeskApplicants(
  ownerId: string,
  listingId?: string
): Promise<Applicant[]> {
  const database = getDb();
  if (!database) return [];

  const owned = await database
    .select({ id: listings.id })
    .from(listings)
    .where(
      listingId
        ? and(eq(listings.ownerId, ownerId), eq(listings.id, listingId))
        : eq(listings.ownerId, ownerId)
    );

  const scoped = owned.map((row) => row.id);
  if (!scoped.length) return [];

  const rows = await database
    .select()
    .from(applications)
    .where(
      and(
        inArray(applications.listingId, scoped),
        inArray(applications.status, DESK_VISIBLE_STATUSES)
      )
    )
    .orderBy(desc(applications.submittedAt));

  return rows.map(toApplicant);
}

export async function getApplicationById(id: string): Promise<ApplicationRow | undefined> {
  const database = getDb();
  if (!database) return undefined;
  const [row] = await database
    .select()
    .from(applications)
    .where(eq(applications.id, id))
    .limit(1);
  return row;
}

export type ApplicationStatusView = {
  id: string;
  confirmationId: string;
  status: string;
  paid: boolean;
  packet: StoredPacket | null;
  creditConsent: Awaited<ReturnType<typeof getLatestCreditConsent>>;
};

export async function getApplicationStatus(id: string): Promise<ApplicationStatusView | null> {
  const database = getDb();
  if (!database) return null;

  const [row] = await database
    .select()
    .from(applications)
    .where(eq(applications.id, id))
    .limit(1);
  if (!row) return null;

  const [payment] = await database
    .select()
    .from(payments)
    .where(eq(payments.applicationId, id))
    .limit(1);

  return {
    id: row.id,
    confirmationId: row.confirmationId,
    status: row.status,
    paid: payment?.status === "paid",
    packet: (row.packet as unknown as StoredPacket) ?? null,
    creditConsent: await getLatestCreditConsent(id),
  };
}
