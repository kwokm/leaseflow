import type { Applicant, ApplicationStatus } from "@/lib/data/mock-data";

export type LandlordDecision = "approved" | "declined";

export function isLandlordDecision(value: unknown): value is LandlordDecision {
  return value === "approved" || value === "declined";
}

/**
 * Queue status the desk shows. Decision wins so a completed screening that
 * was approved still reads Approved after a reload — without rewriting
 * `applications.status`.
 */
export function deskStatusFrom(row: {
  status: string;
  decision?: string | null;
}): ApplicationStatus {
  if (row.decision === "approved" || row.decision === "declined") {
    return row.decision;
  }
  if (row.status === "approved" || row.status === "declined") {
    return row.status;
  }
  if (row.status === "completed") return "completed";
  return "in_progress";
}

export function canWriteListingDecision(input: {
  viewerUserId: string | null | undefined;
  listingOwnerId: string | null | undefined;
}): boolean {
  return Boolean(input.viewerUserId && input.listingOwnerId && input.viewerUserId === input.listingOwnerId);
}

export function applyDecisionToApplicant(
  applicant: Applicant,
  decision: LandlordDecision,
  decidedAt: string = new Date().toISOString(),
): Applicant {
  return {
    ...applicant,
    status: decision,
    decision,
    decidedAt,
  };
}
