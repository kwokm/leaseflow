import {
  getAllApplications,
  getApplicantsByProperty,
  isDemoDataLoaded,
  type Applicant,
  type ApplicationStatus,
} from "@/lib/data/mock-data";
import { loadSubmissions } from "@/lib/apply/storage";
import { submissionApplicant } from "@/lib/apply/to-packet";
import { loadDecisions, withDecision } from "@/lib/desk/decisions";
import { sortDeskFirst } from "@/lib/desk/display";

export function loadDeskApplicants(includeDemo = isDemoDataLoaded()): Applicant[] {
  const decisions = loadDecisions();
  const submitted = loadSubmissions().map(submissionApplicant);
  const seeded = includeDemo ? getAllApplications() : [];
  return sortDeskFirst([...submitted, ...seeded].map((row) => withDecision(row, decisions)));
}

export function loadDeskApplicantsForListing(propertyId: string): Applicant[] {
  const decisions = loadDecisions();
  const submitted = loadSubmissions()
    .map(submissionApplicant)
    .filter((row) => row.propertyId === propertyId);
  const seeded = isDemoDataLoaded() ? getApplicantsByProperty(propertyId) : [];
  return sortDeskFirst([...submitted, ...seeded].map((row) => withDecision(row, decisions)));
}

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
