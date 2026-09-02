import "server-only";

import { buildMockExperianPull } from "@/lib/apply/experian-mock";
import { isDemoMode } from "@/lib/config/env";

/**
 * Experian Connect — applicant-permissioned credit sharing.
 *
 * The applicant authenticates directly with Experian (knowledge-based
 * authentication), Experian issues a share token, and Experian releases the
 * report to the landlord's PMC. Leaseproof brokers the request; it never sees
 * the applicant's SSN, never sees bureau credentials, and never receives the
 * full report — only the score and the summary the landlord may act on.
 *
 * NOTHING HERE CALLS EXPERIAN. This is the interface the live client will
 * implement, plus a local stub so the flow is exercisable end to end. Wiring the
 * real vendor is a separate change that needs a signed agreement, a resale
 * addendum, and permissible-purpose review.
 */

export type ConnectAuthorizationRequest = {
  applicationId: string;
  /** Where Experian returns the applicant after KBA. */
  returnUrl: string;
  /** Landlord/PMC the report is shared with. */
  recipientReference: string;
  applicant: {
    firstName: string;
    lastName: string;
    email: string;
  };
};

export type ConnectAuthorization = {
  /** Opaque Connect reference. Not a credential and not the report. */
  shareReference: string;
  /** Where to send the applicant for KBA. Null when the stub short-circuits it. */
  kbaUrl: string | null;
  inquiryType: "soft";
  expiresAt: Date;
};

/** Landlord-visible rollup. Deliberately excludes account numbers and tradelines. */
export type ConnectSummary = {
  score: number;
  scoreModel: string;
  onTimePaymentRate: number;
  openAccounts: number;
  oldestAccountYears: number;
  recentInquiries: number;
  publicRecords: number;
  factors: string[];
};

export type ConnectShareResult =
  | { status: "shared"; summary: ConnectSummary; sharedAt: Date }
  | { status: "pending" }
  | { status: "failed"; reason: string };

export interface ExperianConnectClient {
  /** Step 1 — ask Experian for a share, before any money moves. */
  authorize(request: ConnectAuthorizationRequest): Promise<ConnectAuthorization>;
  /**
   * Step 2 — run the share. Called only after the $24.99 fee is captured, so
   * the applicant is charged before their file is touched.
   */
  requestShare(shareReference: string): Promise<ConnectShareResult>;
}

const SHARE_TTL_DAYS = 30;

function expiry(): Date {
  return new Date(Date.now() + SHARE_TTL_DAYS * 24 * 60 * 60 * 1000);
}

/**
 * Local stub. In demo mode it returns the fabricated pull that the prototype has
 * always used so the UI can be clicked through; otherwise it reports the share
 * as pending, which is the honest answer until a live client exists.
 */
class StubConnectClient implements ExperianConnectClient {
  async authorize(request: ConnectAuthorizationRequest): Promise<ConnectAuthorization> {
    return {
      shareReference: `stub-share-${request.applicationId}`,
      // The stub does not send the applicant anywhere; the live client returns
      // Experian's hosted KBA URL here.
      kbaUrl: null,
      inquiryType: "soft",
      expiresAt: expiry(),
    };
  }

  async requestShare(shareReference: string): Promise<ConnectShareResult> {
    if (!isDemoMode()) {
      return { status: "pending" };
    }

    const pull = buildMockExperianPull(shareReference, new Date().toISOString());
    return {
      status: "shared",
      sharedAt: new Date(),
      summary: {
        score: pull.score ?? 0,
        scoreModel: pull.scoreModel ?? "VantageScore 3.0 (demo)",
        onTimePaymentRate: pull.onTimePaymentRate ?? 0,
        openAccounts: pull.openAccounts ?? 0,
        oldestAccountYears: pull.oldestAccountYears ?? 0,
        recentInquiries: pull.recentInquiries ?? 0,
        publicRecords: pull.publicRecords ?? 0,
        factors: pull.factors ?? [],
      },
    };
  }
}

let client: ExperianConnectClient = new StubConnectClient();

export function experianConnect(): ExperianConnectClient {
  return client;
}

/** Seam for tests and for swapping in the live client once it exists. */
export function setExperianConnectClient(next: ExperianConnectClient): void {
  client = next;
}

/** True when a real vendor client has been installed. */
export function connectIsLive(): boolean {
  return !(client instanceof StubConnectClient);
}
