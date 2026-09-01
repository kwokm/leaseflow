import { APPLY_STEPS, TOTAL_STEPS, type ApplyState } from "@/lib/apply/types";
import { loadDraft, loadSubmissions } from "@/lib/apply/storage";
import {
  FEATURED_LISTING_ID,
  getApplicantById,
  getPropertyById,
  type Applicant,
  type ApplicationStatus,
  type Property,
} from "@/lib/data/mock-data";

export const TENANT_APPLICANT_ID = "app-jane";

export type TenantPacket = {
  property: Property;
  applicant: Applicant;
  draft: ApplyState;
  submitted: boolean;
  status: ApplicationStatus;
  step: number;
  stepName: string;
};

export function loadTenantPacket(listingId = FEATURED_LISTING_ID): TenantPacket | null {
  const property = getPropertyById(listingId) ?? getPropertyById(FEATURED_LISTING_ID);
  const seeded = getApplicantById(TENANT_APPLICANT_ID);
  if (!property || !seeded) return null;

  const draft = loadDraft(property.id, property.screeningPackage);
  const submission = loadSubmissions().find((entry) => entry.listingId === property.id);
  const submitted = Boolean(submission);
  const status: ApplicationStatus = submitted ? "completed" : seeded.status;
  const step = submitted ? TOTAL_STEPS : draft.step;
  const stepName = APPLY_STEPS.find((entry) => entry.id === step)?.name ?? "Start";

  return {
    property,
    applicant: {
      ...seeded,
      propertyId: property.id,
      status,
      firstName: draft.personal.firstName || seeded.firstName,
      lastName: draft.personal.lastName || seeded.lastName,
      email: draft.personal.email || seeded.email,
      phone: draft.personal.phone || seeded.phone,
      leaseScore: submitted ? draft.experian.score ?? seeded.leaseScore : seeded.leaseScore,
    },
    draft: submission ?? draft,
    submitted,
    status,
    step,
    stepName,
  };
}

export function tenantStatusLabel(status: ApplicationStatus, submitted: boolean): string {
  if (submitted && status === "completed") return "Submitted";
  switch (status) {
    case "approved":
      return "Approved";
    case "declined":
      return "Declined";
    case "completed":
      return "Submitted";
    case "in_progress":
      return "In progress";
    case "invited":
      return "Invited";
  }
}
