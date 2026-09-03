import "server-only";

import { desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import {
  adverseActionNotices,
  applications,
  creditShares,
  listings,
  type AdverseActionNoticeRow,
} from "@/lib/db/schema";
import { isDemoMode } from "@/lib/config/env";
import { newId } from "@/lib/ids";
import {
  ADVERSE_ACTION_COPY_VERSION,
  creditScoreFromPacket,
  formatNoticeDate,
  parseActionTypes,
  renderAdverseActionLetter,
  renderAdverseActionSubject,
  type PacketScoreSource,
} from "@/lib/legal/adverse-action";
import {
  CFPB_SUMMARY_OF_RIGHTS_HREF,
  CFPB_SUMMARY_OF_RIGHTS_TITLE,
  type AdverseActionType,
} from "@/lib/legal/fcra";
import { sendOrQueueEmail } from "@/lib/mail/send";

export type AdverseActionScoreSource = PacketScoreSource;

export type SendAdverseActionInput = {
  applicationId: string;
  listingId: string;
  landlordId: string | null;
  applicantUserId: string | null;
  applicantFullName: string;
  applicantEmail: string;
  propertyAddress: string;
  actionTypes: AdverseActionType[];
  otherAction?: string;
  landlordName: string;
  landlordAddress: string;
  landlordPhone: string;
  landlordEmail: string;
  score?: AdverseActionScoreSource | null;
};

export type AdverseActionNoticeView = {
  noticeId: string;
  applicationId: string;
  listingId: string;
  landlordId: string | null;
  applicantUserId: string | null;
  actionTypes: AdverseActionType[];
  otherAction: string | null;
  letterText: string;
  letterSubject: string;
  copyVersion: string;
  sentAt: string;
  deliveryChannel: "email" | "packet";
  emailStatus: "sent" | "queued";
  emailQueuedReason?: string;
  scoreBlockIncluded: boolean;
  enclosureHref: string;
  persisted: boolean;
};

export class AdverseActionError extends Error {
  status = 400;
  constructor(message: string, status = 400) {
    super(message);
    this.name = "AdverseActionError";
    this.status = status;
  }
}

function toView(
  row: AdverseActionNoticeRow,
  extras?: { emailQueuedReason?: string; persisted?: boolean }
): AdverseActionNoticeView {
  const snapshot = row.packetSnapshot ?? {};
  const queuedReason =
    extras?.emailQueuedReason ??
    (typeof snapshot.emailQueuedReason === "string" ? snapshot.emailQueuedReason : undefined);

  return {
    noticeId: row.id,
    applicationId: row.applicationId,
    listingId: row.listingId,
    landlordId: row.landlordId,
    applicantUserId: row.applicantUserId,
    actionTypes: parseActionTypes(row.actionTypes),
    otherAction: row.otherAction,
    letterText: row.letterText,
    letterSubject: row.letterSubject,
    copyVersion: row.copyVersion,
    sentAt: row.sentAt.toISOString(),
    deliveryChannel: row.deliveryChannel === "email" ? "email" : "packet",
    emailStatus: row.emailStatus === "sent" ? "sent" : "queued",
    emailQueuedReason: queuedReason,
    scoreBlockIncluded: row.scoreBlockIncluded,
    enclosureHref: CFPB_SUMMARY_OF_RIGHTS_HREF,
    persisted: extras?.persisted ?? true,
  };
}

function assertSendable(input: SendAdverseActionInput): void {
  if (!input.actionTypes.length) {
    throw new AdverseActionError("Pick at least one action before sending the notice.");
  }
  if (input.actionTypes.includes("other") && !input.otherAction?.trim()) {
    throw new AdverseActionError("Describe the other action.");
  }
  if (!input.applicantEmail.trim() || !input.applicantFullName.trim()) {
    throw new AdverseActionError("Applicant name and email are required.");
  }
  if (!input.propertyAddress.trim()) {
    throw new AdverseActionError("Property address is required.");
  }
  if (!input.landlordName.trim() || !input.landlordEmail.trim()) {
    throw new AdverseActionError("Landlord name and email are required on the notice.");
  }
}

function buildLetter(input: SendAdverseActionInput, sentAt: Date) {
  const creditScore = creditScoreFromPacket(input.score);
  const letterSubject = renderAdverseActionSubject(input.propertyAddress);
  const letterText = renderAdverseActionLetter({
    letterDate: formatNoticeDate(sentAt),
    applicantFullName: input.applicantFullName.trim(),
    applicantEmail: input.applicantEmail.trim(),
    propertyAddress: input.propertyAddress.trim(),
    actionTypes: input.actionTypes,
    otherAction: input.otherAction,
    landlordName: input.landlordName.trim(),
    landlordAddress: input.landlordAddress.trim(),
    landlordPhone: input.landlordPhone.trim(),
    landlordEmail: input.landlordEmail.trim(),
    creditScore,
  });

  return { letterSubject, letterText, creditScore };
}

function packetSnapshot(input: SendAdverseActionInput, extras: Record<string, unknown>) {
  return {
    propertyAddress: input.propertyAddress,
    applicantFullName: input.applicantFullName,
    applicantEmail: input.applicantEmail,
    landlordName: input.landlordName,
    landlordAddress: input.landlordAddress,
    landlordPhone: input.landlordPhone,
    landlordEmail: input.landlordEmail,
    experian: input.score
      ? {
          score: input.score.score ?? null,
          scoreModel: input.score.scoreModel ?? null,
          pulledAt: input.score.pulledAt ?? null,
          scoreDate: input.score.scoreDate ?? null,
          rangeLow: input.score.rangeLow ?? null,
          rangeHigh: input.score.rangeHigh ?? null,
          factors: input.score.factors ?? [],
        }
      : null,
    enclosure: {
      title: CFPB_SUMMARY_OF_RIGHTS_TITLE,
      href: CFPB_SUMMARY_OF_RIGHTS_HREF,
    },
    ...extras,
  };
}

export async function sendAdverseActionNotice(
  input: SendAdverseActionInput
): Promise<AdverseActionNoticeView> {
  assertSendable(input);

  const sentAt = new Date();
  const { letterSubject, letterText, creditScore } = buildLetter(input, sentAt);

  const mail = await sendOrQueueEmail({
    to: input.applicantEmail.trim(),
    subject: letterSubject,
    text: letterText,
    enclosureHref: CFPB_SUMMARY_OF_RIGHTS_HREF,
    enclosureTitle: CFPB_SUMMARY_OF_RIGHTS_TITLE,
  });

  const deliveryChannel = mail.status === "sent" ? "email" : "packet";
  const emailStatus = mail.status;
  const emailQueuedReason = mail.status === "queued" ? mail.reason : undefined;
  const snapshot = packetSnapshot(input, {
    emailStatus,
    deliveryChannel,
    emailQueuedReason: emailQueuedReason ?? null,
    queuedEmail: mail.status === "queued" ? mail.queued : null,
  });

  const view: AdverseActionNoticeView = {
    noticeId: crypto.randomUUID(),
    applicationId: input.applicationId,
    listingId: input.listingId,
    landlordId: input.landlordId,
    applicantUserId: input.applicantUserId,
    actionTypes: input.actionTypes,
    otherAction: input.otherAction?.trim() || null,
    letterText,
    letterSubject,
    copyVersion: ADVERSE_ACTION_COPY_VERSION,
    sentAt: sentAt.toISOString(),
    deliveryChannel,
    emailStatus,
    emailQueuedReason,
    scoreBlockIncluded: Boolean(creditScore),
    enclosureHref: CFPB_SUMMARY_OF_RIGHTS_HREF,
    persisted: false,
  };

  const database = getDb();
  if (!database) {
    if (!isDemoMode()) {
      throw new AdverseActionError("The notice could not be archived.", 503);
    }
    return view;
  }

  const [application] = await database
    .select()
    .from(applications)
    .where(eq(applications.id, input.applicationId))
    .limit(1);

  if (!application) {
    // Seeded desk packets (app-1, Jane) have no Neon row. Archive stays
    // append-only in the client store; do not invent an application.
    if (isDemoMode()) return view;
    throw new AdverseActionError("Application not found.", 404);
  }

  const row = {
    id: newId("aan"),
    applicationId: application.id,
    listingId: application.listingId,
    landlordId: input.landlordId,
    applicantUserId: application.applicantUserId ?? input.applicantUserId,
    actionTypes: input.actionTypes,
    otherAction: view.otherAction,
    letterText,
    letterSubject,
    copyVersion: ADVERSE_ACTION_COPY_VERSION,
    sentAt,
    deliveryChannel,
    emailStatus,
    packetSnapshot: snapshot,
    scoreBlockIncluded: Boolean(creditScore),
  };

  const [inserted] = await database.insert(adverseActionNotices).values(row).returning();
  return toView(inserted ?? { ...row }, { emailQueuedReason, persisted: true });
}

export async function listAdverseActionNotices(
  applicationId: string
): Promise<AdverseActionNoticeView[]> {
  const database = getDb();
  if (!database) return [];

  const rows = await database
    .select()
    .from(adverseActionNotices)
    .where(eq(adverseActionNotices.applicationId, applicationId))
    .orderBy(desc(adverseActionNotices.sentAt));

  return rows.map((row) => toView(row));
}

export async function scoreFromStoredShare(
  applicationId: string
): Promise<AdverseActionScoreSource | null> {
  const database = getDb();
  if (!database) return null;

  const [share] = await database
    .select()
    .from(creditShares)
    .where(eq(creditShares.applicationId, applicationId))
    .limit(1);

  if (!share || share.score == null) return null;

  const summary = (share.summary ?? {}) as Record<string, unknown>;
  const factors = Array.isArray(summary.factors)
    ? summary.factors.filter((factor): factor is string => typeof factor === "string")
    : [];

  return {
    score: share.score,
    scoreModel: share.scoreModel,
    pulledAt: share.sharedAt?.toISOString() ?? null,
    rangeLow: typeof summary.rangeLow === "number" || typeof summary.rangeLow === "string"
      ? summary.rangeLow
      : null,
    rangeHigh:
      typeof summary.rangeHigh === "number" || typeof summary.rangeHigh === "string"
        ? summary.rangeHigh
        : null,
    factors,
  };
}

export async function listingOwnedBy(listingId: string, ownerId: string): Promise<boolean> {
  const database = getDb();
  if (!database) return false;
  const [listing] = await database
    .select({ ownerId: listings.ownerId })
    .from(listings)
    .where(eq(listings.id, listingId))
    .limit(1);
  return listing?.ownerId === ownerId;
}

export async function applicationForNotice(applicationId: string) {
  const database = getDb();
  if (!database) return null;
  const [row] = await database
    .select()
    .from(applications)
    .where(eq(applications.id, applicationId))
    .limit(1);
  return row ?? null;
}

