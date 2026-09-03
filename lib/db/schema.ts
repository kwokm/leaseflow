import {
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

/**
 * Leaseproof v1 is the screening packet only: a landlord posts a listing, a
 * renter applies, pays $24.99, and a credit share is requested. Nothing here
 * models leases, showings, or rent collection.
 *
 * Sensitive values (SSN, full credit reports, bureau tokens) are deliberately
 * absent — see lib/screening/experian-connect.ts for why only the share
 * reference and a summary are ever stored.
 */

export const users = pgTable(
  "users",
  {
    id: text("id").primaryKey(),
    clerkUserId: text("clerk_user_id").notNull(),
    email: text("email").notNull(),
    role: text("role").notNull().default("renter"),
    firstName: text("first_name"),
    lastName: text("last_name"),
    phone: text("phone"),
    company: text("company"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    clerkIdx: uniqueIndex("users_clerk_user_id_idx").on(table.clerkUserId),
    emailIdx: index("users_email_idx").on(table.email),
  })
);

export const listings = pgTable(
  "listings",
  {
    id: text("id").primaryKey(),
    ownerId: text("owner_id").references(() => users.id, { onDelete: "set null" }),
    address: text("address").notNull(),
    rent: integer("rent").notNull().default(0),
    bedrooms: numeric("bedrooms", { precision: 4, scale: 1 }).notNull().default("0"),
    bathrooms: numeric("bathrooms", { precision: 4, scale: 1 }).notNull().default("0"),
    sqft: integer("sqft"),
    availableDate: text("available_date"),
    screeningPackage: text("screening_package").notNull().default("standard"),
    photos: jsonb("photos").$type<string[]>().notNull().default([]),
    neighborhood: text("neighborhood"),
    propertyType: text("property_type"),
    zillowUrl: text("zillow_url"),
    zpid: text("zpid"),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    ownerIdx: index("listings_owner_id_idx").on(table.ownerId),
  })
);

/**
 * People applying together (Sarah + Jessica on 170 Chorus). A household is
 * scoped to one listing; solo applicants simply have no household.
 */
export const households = pgTable(
  "households",
  {
    id: text("id").primaryKey(),
    listingId: text("listing_id")
      .notNull()
      .references(() => listings.id, { onDelete: "cascade" }),
    label: text("label"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    listingIdx: index("households_listing_id_idx").on(table.listingId),
  })
);

export const applications = pgTable(
  "applications",
  {
    id: text("id").primaryKey(),
    confirmationId: text("confirmation_id").notNull(),
    listingId: text("listing_id")
      .notNull()
      .references(() => listings.id, { onDelete: "cascade" }),
    householdId: text("household_id").references(() => households.id, {
      onDelete: "set null",
    }),
    applicantUserId: text("applicant_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    email: text("email").notNull(),
    phone: text("phone"),
    /** Screening lifecycle: draft -> awaiting_payment -> paid -> screening -> completed. */
    status: text("status").notNull().default("draft"),
    screeningPackage: text("screening_package").notNull().default("standard"),
    /**
     * The packet the renter filled in, minus anything sensitive. The API strips
     * SSN and card data before this is written — see lib/apply/sanitize.ts.
     */
    packet: jsonb("packet").$type<Record<string, unknown>>().notNull().default({}),
    leaseScore: integer("lease_score"),
    submittedAt: timestamp("submitted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    confirmationIdx: uniqueIndex("applications_confirmation_id_idx").on(table.confirmationId),
    listingIdx: index("applications_listing_id_idx").on(table.listingId),
    householdIdx: index("applications_household_id_idx").on(table.householdId),
    applicantIdx: index("applications_applicant_user_id_idx").on(table.applicantUserId),
  })
);

/** Uploaded ID and income documents. Bytes live in Blob storage, not Postgres. */
export const documents = pgTable(
  "documents",
  {
    id: text("id").primaryKey(),
    applicationId: text("application_id")
      .notNull()
      .references(() => applications.id, { onDelete: "cascade" }),
    kind: text("kind").notNull(),
    filename: text("filename").notNull(),
    mime: text("mime").notNull(),
    size: integer("size").notNull().default(0),
    blobUrl: text("blob_url").notNull(),
    /** Blob pathname, kept so the object can be deleted when an app is purged. */
    blobPathname: text("blob_pathname"),
    uploadedAt: timestamp("uploaded_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    applicationIdx: index("documents_application_id_idx").on(table.applicationId),
  })
);

/**
 * Timestamped record of each authorization the applicant gave. `version` cites
 * the copy pack the applicant actually saw, so a later wording change does not
 * retroactively rewrite what was agreed to.
 */
export const consents = pgTable(
  "consents",
  {
    id: text("id").primaryKey(),
    applicationId: text("application_id")
      .notNull()
      .references(() => applications.id, { onDelete: "cascade" }),
    kind: text("kind").notNull(),
    version: text("version").notNull(),
    granted: boolean("granted").notNull().default(true),
    signature: text("signature"),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    acceptedAt: timestamp("accepted_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    applicationIdx: index("consents_application_id_idx").on(table.applicationId),
  })
);

/**
 * Append-only Credit-step archive. Historical rows are never rewritten — the
 * only later write allowed is filling `experian_share_id` (and optionally
 * `kba_succeeded_at`) once Connect returns a handle.
 *
 * Do not store SSN, KBA answers, or Experian credentials here.
 */
export const creditConsents = pgTable(
  "credit_consents",
  {
    id: text("id").primaryKey(),
    applicantUserId: text("applicant_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    applicationId: text("application_id")
      .notNull()
      .references(() => applications.id, { onDelete: "cascade" }),
    listingId: text("listing_id")
      .notNull()
      .references(() => listings.id, { onDelete: "cascade" }),
    landlordId: text("landlord_id").references(() => users.id, { onDelete: "set null" }),
    consentedAt: timestamp("consented_at", { withTimezone: true }).notNull(),
    copyVersion: text("copy_version").notNull(),
    copySha256: text("copy_sha256").notNull(),
    disclosureText: text("disclosure_text").notNull(),
    checkboxAuth: boolean("checkbox_auth").notNull(),
    checkboxUse: boolean("checkbox_use").notNull(),
    checkboxAuthLabel: text("checkbox_auth_label").notNull(),
    checkboxUseLabel: text("checkbox_use_label").notNull(),
    typedFullName: text("typed_full_name").notNull(),
    purpose: text("purpose").notNull().default("housing_application"),
    recipientName: text("recipient_name").notNull(),
    locale: text("locale").notNull().default("en-US"),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    disclosureSnapshotHtml: text("disclosure_snapshot_html").notNull(),
    experianShareId: text("experian_share_id"),
    kbaSucceededAt: timestamp("kba_succeeded_at", { withTimezone: true }),
  },
  (table) => ({
    applicationIdx: index("credit_consents_application_id_idx").on(table.applicationId),
    listingIdx: index("credit_consents_listing_id_idx").on(table.listingId),
    applicantIdx: index("credit_consents_applicant_user_id_idx").on(table.applicantUserId),
  })
);

/** Applicant-paid screening fee. Amounts are minor units to avoid float drift. */
export const payments = pgTable(
  "payments",
  {
    id: text("id").primaryKey(),
    applicationId: text("application_id")
      .notNull()
      .references(() => applications.id, { onDelete: "cascade" }),
    provider: text("provider").notNull().default("stripe"),
    stripeCheckoutSessionId: text("stripe_checkout_session_id"),
    stripePaymentIntentId: text("stripe_payment_intent_id"),
    amountCents: integer("amount_cents").notNull(),
    currency: text("currency").notNull().default("usd"),
    /** pending -> paid -> refunded / failed. */
    status: text("status").notNull().default("pending"),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    applicationIdx: index("payments_application_id_idx").on(table.applicationId),
    sessionIdx: uniqueIndex("payments_stripe_session_idx").on(table.stripeCheckoutSessionId),
  })
);

/**
 * Experian Connect is applicant-permissioned: the renter authenticates with
 * Experian, and Experian shares the report with the landlord. We store the
 * share reference and the summary the landlord is allowed to see — never the
 * report itself, never SSN, never bureau credentials.
 */
export const creditShares = pgTable(
  "credit_shares",
  {
    id: text("id").primaryKey(),
    applicationId: text("application_id")
      .notNull()
      .references(() => applications.id, { onDelete: "cascade" }),
    provider: text("provider").notNull().default("experian_connect"),
    /** authorized -> awaiting_payment -> requested -> shared -> failed. */
    status: text("status").notNull().default("authorized"),
    /** Opaque Connect reference. Not a credential and not the report. */
    shareReference: text("share_reference"),
    inquiryType: text("inquiry_type").notNull().default("soft"),
    score: integer("score"),
    scoreModel: text("score_model"),
    /** Landlord-visible rollup only (open accounts, on-time rate, and so on). */
    summary: jsonb("summary").$type<Record<string, unknown>>(),
    authorizedAt: timestamp("authorized_at", { withTimezone: true }),
    requestedAt: timestamp("requested_at", { withTimezone: true }),
    sharedAt: timestamp("shared_at", { withTimezone: true }),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    failureReason: text("failure_reason"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    applicationIdx: index("credit_shares_application_id_idx").on(table.applicationId),
  })
);

/**
 * Append-only written adverse-action notices. Historical rows are never
 * rewritten — a later send is a new row. `letter_text` is the verbatim letter
 * as generated for the applicant.
 */
export const adverseActionNotices = pgTable(
  "adverse_action_notices",
  {
    id: text("id").primaryKey(),
    applicationId: text("application_id")
      .notNull()
      .references(() => applications.id, { onDelete: "cascade" }),
    listingId: text("listing_id")
      .notNull()
      .references(() => listings.id, { onDelete: "cascade" }),
    landlordId: text("landlord_id").references(() => users.id, { onDelete: "set null" }),
    applicantUserId: text("applicant_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    actionTypes: jsonb("action_types").$type<string[]>().notNull(),
    otherAction: text("other_action"),
    letterText: text("letter_text").notNull(),
    letterSubject: text("letter_subject").notNull(),
    copyVersion: text("copy_version").notNull(),
    sentAt: timestamp("sent_at", { withTimezone: true }).notNull(),
    /** `email` when a mailer accepted the message; `packet` when email was queued. */
    deliveryChannel: text("delivery_channel").notNull(),
    /** Honest send status. Never recorded as sent unless a mailer accepted it. */
    emailStatus: text("email_status").notNull(),
    packetSnapshot: jsonb("packet_snapshot").$type<Record<string, unknown>>().notNull(),
    scoreBlockIncluded: boolean("score_block_included").notNull().default(false),
  },
  (table) => ({
    applicationIdx: index("adverse_action_notices_application_id_idx").on(table.applicationId),
    listingIdx: index("adverse_action_notices_listing_id_idx").on(table.listingId),
    landlordIdx: index("adverse_action_notices_landlord_id_idx").on(table.landlordId),
  })
);

/**
 * Mac Studio pull-queue for AI Income Check. Vercel never calls the Studio;
 * the worker claims a pending row, reads the blob through the worker file
 * route, and writes extraction back. Bytes stay in Blob — this row is the
 * extracted fields plus job state.
 */
export const incomeChecks = pgTable(
  "income_checks",
  {
    id: text("id").primaryKey(),
    applicationId: text("application_id").references(() => applications.id, {
      onDelete: "set null",
    }),
    listingId: text("listing_id").references(() => listings.id, {
      onDelete: "set null",
    }),
    documentId: text("document_id").references(() => documents.id, {
      onDelete: "set null",
    }),
    applicantName: text("applicant_name").notNull().default(""),
    docKind: text("doc_kind").notNull(),
    blobPath: text("blob_path").notNull(),
    fileName: text("file_name").notNull(),
    /** pending -> claimed -> ready | error */
    status: text("status").notNull().default("pending"),
    claimedAt: timestamp("claimed_at", { withTimezone: true }),
    claimedBy: text("claimed_by"),
    errorText: text("error_text"),
    monthlyGrossCents: integer("monthly_gross_cents"),
    payFrequency: text("pay_frequency"),
    employer: text("employer"),
    periodStart: text("period_start"),
    periodEnd: text("period_end"),
    detectedName: text("detected_name"),
    nameMatch: boolean("name_match"),
    recency: text("recency"),
    recencyLabel: text("recency_label"),
    extractor: text("extractor"),
    rawJson: jsonb("raw_json").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    statusIdx: index("income_checks_status_idx").on(table.status),
    applicationIdx: index("income_checks_application_id_idx").on(table.applicationId),
    listingIdx: index("income_checks_listing_id_idx").on(table.listingId),
    createdIdx: index("income_checks_created_at_idx").on(table.createdAt),
  })
);

export type UserRow = typeof users.$inferSelect;
export type ListingRow = typeof listings.$inferSelect;
export type NewListingRow = typeof listings.$inferInsert;
export type ApplicationRow = typeof applications.$inferSelect;
export type NewApplicationRow = typeof applications.$inferInsert;
export type DocumentRow = typeof documents.$inferSelect;
export type ConsentRow = typeof consents.$inferSelect;
export type CreditConsentRow = typeof creditConsents.$inferSelect;
export type PaymentRow = typeof payments.$inferSelect;
export type CreditShareRow = typeof creditShares.$inferSelect;
export type AdverseActionNoticeRow = typeof adverseActionNotices.$inferSelect;
export type IncomeCheckRow = typeof incomeChecks.$inferSelect;
export type NewIncomeCheckRow = typeof incomeChecks.$inferInsert;
