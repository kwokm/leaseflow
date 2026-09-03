import "server-only";

import { and, desc, eq, isNull } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import {
  applications,
  creditConsents,
  listings,
  users,
  type CreditConsentRow,
} from "@/lib/db/schema";
import { newConfirmationId, newId } from "@/lib/ids";
import { isDemoMode } from "@/lib/config/env";
import { demoPropertyById } from "@/lib/data/mock-data";
import {
  CONSENT_AUTH_CHECKBOX,
  CONSENT_USE_CHECKBOX,
  CREDIT_CONSENT_LOCALE,
  CREDIT_CONSENT_PURPOSE,
  CREDIT_DISCLOSURE_BODY,
  FCRA_PACK_VERSION,
  creditConsentReady,
} from "@/lib/legal/fcra";
import {
  creditDisclosureSha256,
  creditDisclosureSnapshotHtml,
} from "@/lib/legal/fcra-archive";

export type CreditConsentInput = {
  listingId: string;
  applicationId?: string;
  existingConsentId?: string;
  applicantUserId: string | null;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  checkboxAuth: boolean;
  checkboxUse: boolean;
  typedFullName: string;
  locale?: string;
  ipAddress: string | null;
  userAgent: string | null;
};

export type ArchivedCreditConsent = {
  consentId: string;
  applicationId: string;
  listingId: string;
  landlordId: string | null;
  applicantUserId: string | null;
  consentedAt: string;
  copyVersion: string;
  copySha256: string;
  disclosureText: string;
  checkboxAuth: boolean;
  checkboxUse: boolean;
  typedFullName: string;
  purpose: string;
  recipientName: string;
  locale: string;
  experianShareId: string | null;
  persisted: boolean;
};

function toView(row: CreditConsentRow, persisted: boolean): ArchivedCreditConsent {
  return {
    consentId: row.id,
    applicationId: row.applicationId,
    listingId: row.listingId,
    landlordId: row.landlordId,
    applicantUserId: row.applicantUserId,
    consentedAt: row.consentedAt.toISOString(),
    copyVersion: row.copyVersion,
    copySha256: row.copySha256,
    disclosureText: row.disclosureText,
    checkboxAuth: row.checkboxAuth,
    checkboxUse: row.checkboxUse,
    typedFullName: row.typedFullName,
    purpose: row.purpose,
    recipientName: row.recipientName,
    locale: row.locale,
    experianShareId: row.experianShareId,
    persisted,
  };
}

function ephemeralConsent(
  input: CreditConsentInput,
  applicationId: string,
  recipientName: string
): ArchivedCreditConsent {
  const consentedAt = new Date().toISOString();
  return {
    consentId: input.existingConsentId ?? crypto.randomUUID(),
    applicationId,
    listingId: input.listingId,
    landlordId: null,
    applicantUserId: input.applicantUserId,
    consentedAt,
    copyVersion: FCRA_PACK_VERSION,
    copySha256: creditDisclosureSha256(),
    disclosureText: CREDIT_DISCLOSURE_BODY,
    checkboxAuth: true,
    checkboxUse: true,
    typedFullName: input.typedFullName.trim(),
    purpose: CREDIT_CONSENT_PURPOSE,
    recipientName,
    locale: input.locale?.trim() || CREDIT_CONSENT_LOCALE,
    experianShareId: null,
    persisted: false,
  };
}

export function assertCreditConsentGate(input: {
  checkboxAuth: boolean;
  checkboxUse: boolean;
  typedFullName: string;
}): void {
  if (!creditConsentReady(input)) {
    throw new CreditConsentGateError(
      "Both checkboxes and a typed full name are required before Experian can start."
    );
  }
}

export class CreditConsentGateError extends Error {
  status = 400;
  constructor(message: string) {
    super(message);
    this.name = "CreditConsentGateError";
  }
}

async function recipientForListing(
  listingId: string,
  ownerId: string | null
): Promise<string> {
  const database = getDb();
  if (!database || !ownerId) return "this landlord";

  const [owner] = await database
    .select()
    .from(users)
    .where(eq(users.id, ownerId))
    .limit(1);

  const named = [owner?.firstName, owner?.lastName].filter(Boolean).join(" ").trim();
  return named || owner?.company || "this landlord";
}

/**
 * Demo listings (170 Chorus, etc.) live in mock data until a landlord creates
 * them. A consent row needs a real listing + application, so we upsert the
 * demo catalogue row when Neon is present.
 */
async function ensureListingRow(listingId: string) {
  const database = getDb();
  if (!database) return null;

  const [existing] = await database
    .select()
    .from(listings)
    .where(eq(listings.id, listingId))
    .limit(1);
  if (existing) return existing;

  const demo = demoPropertyById(listingId);
  if (!demo) return null;
  if (!isDemoMode()) return null;

  const [created] = await database
    .insert(listings)
    .values({
      id: demo.id,
      address: demo.address,
      rent: demo.rent,
      bedrooms: String(demo.bedrooms),
      bathrooms: String(demo.bathrooms),
      sqft: demo.sqft ?? null,
      availableDate: demo.availableDate || null,
      photos: demo.photos ?? [],
      neighborhood: demo.neighborhood ?? null,
      propertyType: demo.propertyType ?? null,
      zillowUrl: demo.zillowUrl ?? null,
      zpid: demo.zpid ?? null,
    })
    .returning();

  return created ?? null;
}

async function ensureDraftApplication(
  input: CreditConsentInput
): Promise<{ id: string; listingOwnerId: string | null }> {
  const database = getDb();
  if (!database) {
    return { id: input.applicationId ?? newId("app"), listingOwnerId: null };
  }

  if (input.applicationId) {
    const [existing] = await database
      .select()
      .from(applications)
      .where(eq(applications.id, input.applicationId))
      .limit(1);
    if (existing) {
      return { id: existing.id, listingOwnerId: null };
    }
  }

  const listing = await ensureListingRow(input.listingId);
  if (!listing) {
    throw new CreditConsentGateError("Listing not found.");
  }

  const applicationId = newId("app");
  await database.insert(applications).values({
    id: applicationId,
    confirmationId: newConfirmationId(),
    listingId: listing.id,
    applicantUserId: input.applicantUserId,
    firstName: input.firstName || "Applicant",
    lastName: input.lastName || "Draft",
    email: input.email,
    phone: input.phone ?? null,
    status: "draft",
    screeningPackage: "standard",
    packet: {},
  });

  return { id: applicationId, listingOwnerId: listing.ownerId };
}

/**
 * Writes an immutable consent row, or returns the existing one on retry.
 * Never mutates disclosure fields. Experian must not be called before this
 * returns.
 */
export async function archiveCreditConsent(
  input: CreditConsentInput
): Promise<ArchivedCreditConsent> {
  assertCreditConsentGate(input);

  const database = getDb();
  const draft = await ensureDraftApplication(input);
  const recipientName = await recipientForListing(input.listingId, draft.listingOwnerId);

  if (!database) {
    if (!isDemoMode()) {
      throw new CreditConsentGateError("Authorization could not be saved.");
    }
    return ephemeralConsent(input, draft.id, recipientName);
  }

  if (input.existingConsentId) {
    const [existing] = await database
      .select()
      .from(creditConsents)
      .where(eq(creditConsents.id, input.existingConsentId))
      .limit(1);
    if (existing) return toView(existing, true);
  }

  const listing = await ensureListingRow(input.listingId);
  const landlordId = listing?.ownerId ?? draft.listingOwnerId;
  const named = await recipientForListing(input.listingId, landlordId);
  const consentedAt = new Date();
  const locale = input.locale?.trim() || CREDIT_CONSENT_LOCALE;
  const typedFullName = input.typedFullName.trim();

  const row = {
    id: crypto.randomUUID(),
    applicantUserId: input.applicantUserId,
    applicationId: draft.id,
    listingId: input.listingId,
    landlordId,
    consentedAt,
    copyVersion: FCRA_PACK_VERSION,
    copySha256: creditDisclosureSha256(),
    disclosureText: CREDIT_DISCLOSURE_BODY,
    checkboxAuth: true,
    checkboxUse: true,
    checkboxAuthLabel: CONSENT_AUTH_CHECKBOX,
    checkboxUseLabel: CONSENT_USE_CHECKBOX,
    typedFullName,
    purpose: CREDIT_CONSENT_PURPOSE,
    recipientName: named,
    locale,
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
    disclosureSnapshotHtml: creditDisclosureSnapshotHtml({
      typedFullName,
      recipientName: named,
      locale,
    }),
    experianShareId: null,
  };

  const [inserted] = await database.insert(creditConsents).values(row).returning();
  return toView(inserted ?? { ...row, kbaSucceededAt: null }, true);
}

/**
 * The only mutation allowed on a historical consent row: attach the Connect
 * share handle once it exists. No-ops if a share id is already set.
 */
export async function attachExperianShare(
  consentId: string,
  shareId: string,
  kbaSucceeded?: boolean
): Promise<void> {
  const database = getDb();
  if (!database) return;

  const [existing] = await database
    .select()
    .from(creditConsents)
    .where(eq(creditConsents.id, consentId))
    .limit(1);
  if (!existing) return;
  if (existing.experianShareId) return;

  await database
    .update(creditConsents)
    .set({
      experianShareId: shareId,
      kbaSucceededAt: kbaSucceeded ? new Date() : existing.kbaSucceededAt,
    })
    .where(and(eq(creditConsents.id, consentId), isNull(creditConsents.experianShareId)));
}

export async function getLatestCreditConsent(
  applicationId: string
): Promise<ArchivedCreditConsent | null> {
  const database = getDb();
  if (!database) return null;

  const [row] = await database
    .select()
    .from(creditConsents)
    .where(eq(creditConsents.applicationId, applicationId))
    .orderBy(desc(creditConsents.consentedAt))
    .limit(1);

  return row ? toView(row, true) : null;
}
