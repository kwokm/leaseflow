import type { Applicant, ApplicationStatus } from "@/lib/data/mock-data";

/**
 * Pure rollups over a set of applicants. Fetching now lives in
 * lib/desk/use-desk-applicants.ts — the queue itself comes from Neon.
 */

export function leadStatus(statuses: ApplicationStatus[]): ApplicationStatus | undefined {
  if (statuses.includes("approved")) return "approved";
  if (statuses.includes("completed")) return "completed";
  if (statuses.includes("declined")) return "declined";
  if (statuses.includes("in_progress")) return "in_progress";
  if (statuses.includes("invited")) return "invited";
  return undefined;
}

export function listingRollup(applicants: Applicant[]) {
  const scores = applicants
    .map((row) => row.leaseScore)
    .filter((score): score is number => typeof score === "number");

  return {
    count: applicants.length,
    leadScore: scores.length ? Math.max(...scores) : undefined,
    avgScore: scores.length
      ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
      : undefined,
    leadStatus: leadStatus(applicants.map((row) => row.status)),
  };
}
