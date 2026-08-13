import type {
  Applicant,
  ApplicationDetails,
  ApplicationDocument,
  ExperianPull,
  ScreeningReport,
} from "@/lib/data/mock-data";
import { getPropertyById } from "@/lib/data/mock-data";
import { formatFileSize, ssnLast4 } from "./format";
import type { ApplyState, LocalFile } from "./types";

/** Applications submitted from this browser get a `local-` prefixed id. */
export const LOCAL_ID_PREFIX = "local-";

export function localApplicantId(confirmationId: string): string {
  return `${LOCAL_ID_PREFIX}${confirmationId}`;
}

export function isLocalApplicantId(id: string): boolean {
  return id.startsWith(LOCAL_ID_PREFIX);
}

export function confirmationIdFromApplicantId(id: string): string {
  return id.slice(LOCAL_ID_PREFIX.length);
}

function toDocument(
  file: LocalFile,
  docType: ApplicationDocument["docType"],
  kind: string
): ApplicationDocument {
  return {
    name: file.name,
    kind,
    docType,
    uploadedAt: file.addedAt,
    sizeLabel: formatFileSize(file.size),
  };
}

export function submissionDocuments(state: ApplyState): ApplicationDocument[] {
  const documents: ApplicationDocument[] = [];

  if (state.idFront) documents.push(toDocument(state.idFront, "photo_id_front", "Photo ID — front"));
  if (state.idBack) documents.push(toDocument(state.idBack, "photo_id_back", "Photo ID — back"));
  for (const stub of state.paystubs) documents.push(toDocument(stub, "paystub", "Pay stub"));
  for (const statement of state.statements) {
    documents.push(toDocument(statement, "bank_statement", "Bank statement"));
  }

  return documents;
}

export function submissionApplicant(state: ApplyState): Applicant {
  return {
    id: localApplicantId(state.confirmationId ?? "draft"),
    propertyId: state.listingId,
    status: "completed",
    firstName: state.personal.firstName || "Renter",
    lastName: state.personal.lastName || "Applicant",
    email: state.personal.email,
    phone: state.personal.phone,
    appliedAt: state.submittedAt ?? new Date().toISOString(),
    completedAt: state.submittedAt,
    leaseScore: state.experian.score,
  };
}

export function submissionDetails(state: ApplyState): ApplicationDetails {
  const property = getPropertyById(state.listingId);
  const address = [state.personal.street, state.personal.unit].filter(Boolean).join(" ");
  const fullAddress = [
    address,
    state.personal.city,
    [state.personal.state, state.personal.zip].filter(Boolean).join(" "),
  ]
    .filter(Boolean)
    .join(", ");

  return {
    applicantId: localApplicantId(state.confirmationId ?? "draft"),
    dateOfBirth: state.personal.dateOfBirth,
    ssnLast4: ssnLast4(state.personal.ssn),
    desiredMoveIn: property?.availableDate ?? "",
    currentAddress: {
      address: fullAddress || "Not provided",
      since: "Not provided",
      monthlyRent: 0,
      landlordName: "Not provided",
      landlordPhone: "Not provided",
      reasonForLeaving: "Not provided",
    },
    employment: {
      employer: state.income.employer || "Not provided",
      position: state.income.position || "Not provided",
      startDate: state.income.startDate || "Not provided",
      supervisor: "Not provided",
      supervisorPhone: "Not provided",
      monthlyIncome: Number(state.income.monthlyIncome.replace(/[^0-9.]/g, "")) || 0,
    },
    occupants: state.household.occupants.map((occupant) => ({
      name: occupant.name,
      relationship: occupant.relationship,
      age: Number(occupant.age) || 0,
    })),
    pets: state.household.pets.map((pet) => ({
      type: pet.type,
      breed: pet.breed,
      weight: pet.weight,
    })),
    vehicles: [],
    disclosures: {
      smoker: state.household.smoker,
      priorEviction: state.household.priorEviction,
      bankruptcy: false,
      notes: state.household.notes || undefined,
    },
    documents: submissionDocuments(state),
    consent: {
      acceptedAt: state.consent.acceptedAt ?? state.submittedAt ?? "",
      signature: state.consent.signature,
      ipAddress: "203.0.113.10",
    },
  };
}

export function submissionExperian(state: ApplyState): ExperianPull | undefined {
  if (state.experian.status !== "connected" || !state.experian.score) return undefined;

  return {
    applicantId: localApplicantId(state.confirmationId ?? "draft"),
    provider: "Experian (demo)",
    status: "connected",
    score: state.experian.score,
    scoreModel: state.experian.scoreModel ?? "VantageScore 3.0 (demo)",
    pulledAt: state.experian.pulledAt ?? state.submittedAt ?? "",
    fileMatched: true,
    onTimePaymentRate: state.experian.onTimePaymentRate ?? 0,
    openAccounts: state.experian.openAccounts ?? 0,
    oldestAccountYears: state.experian.oldestAccountYears ?? 0,
    recentInquiries: state.experian.recentInquiries ?? 0,
    publicRecords: state.experian.publicRecords ?? 0,
    factors: state.experian.factors ?? [],
  };
}

export function submissionReport(state: ApplyState): ScreeningReport | undefined {
  const experian = submissionExperian(state);
  if (!experian) return undefined;

  const monthlyIncome = Number(state.income.monthlyIncome.replace(/[^0-9.]/g, "")) || 0;

  return {
    applicantId: experian.applicantId,
    credit: {
      leaseScore: experian.score,
      paymentHistory: experian.onTimePaymentRate,
      creditUtilization: 32,
      totalAccounts: experian.openAccounts,
      derogatoryMarks: 0,
      hardInquiries: experian.recentInquiries,
    },
    background: {
      criminal: "clear",
      eviction: state.household.priorEviction ? "records_found" : "clear",
      sexOffender: "clear",
      details: "Mock public-records scan — demo data only, no records were searched.",
    },
    income: {
      employer: state.income.employer || "Not provided",
      position: state.income.position || "Not provided",
      monthlyIncome,
      verified: state.paystubs.length >= 2,
    },
    residentialHistory: [],
  };
}
