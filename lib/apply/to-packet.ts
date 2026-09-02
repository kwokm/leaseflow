import type {
  Applicant,
  ApplicationDetails,
  ApplicationDocument,
  ExperianPull,
  ScreeningReport,
} from "@/lib/data/mock-data";
import type { AiIncomeScreen } from "@/lib/data/household-model";
import { getApplicantsByProperty, getPropertyById } from "@/lib/data/mock-data";
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
    previewAvailable: Boolean(file.url),
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

function normalizeName(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

/** Attach an existing household when an occupant name matches a co-tenant on this listing. */
export function householdIdFromOccupants(state: ApplyState): string | undefined {
  const self = normalizeName(`${state.personal.firstName} ${state.personal.lastName}`);
  const wanted = new Set(
    state.household.occupants
      .map((row) => normalizeName(row.name))
      .filter((name) => name && name !== self),
  );
  if (!wanted.size) return undefined;

  const match = getApplicantsByProperty(state.listingId).find((row) =>
    wanted.has(normalizeName(`${row.firstName} ${row.lastName}`)),
  );
  return match?.householdId;
}

export function applyingWithNames(state: ApplyState): string[] {
  const self = normalizeName(`${state.personal.firstName} ${state.personal.lastName}`);
  const fromForm = state.household.occupants
    .map((row) => row.name.trim())
    .filter((name) => name && normalizeName(name) !== self);
  const matched = getApplicantsByProperty(state.listingId)
    .filter((row) =>
      fromForm.some((name) => normalizeName(name) === normalizeName(`${row.firstName} ${row.lastName}`)),
    )
    .map((row) => `${row.firstName} ${row.lastName}`);
  return matched.length ? matched : fromForm;
}

function mockAiIncome(state: ApplyState, monthlyIncome: number): AiIncomeScreen | undefined {
  if (!state.paystubs.length && !monthlyIncome) return undefined;
  const documents = state.paystubs.map((file) => ({
    name: file.name,
    kind: "paystub" as const,
    extractedMonthly: monthlyIncome,
    note: monthlyIncome
      ? `Period gross scaled to $${monthlyIncome.toLocaleString()} / mo`
      : "Gross monthly read from the paystub",
  }));
  return {
    grossMonthly: monthlyIncome,
    source: "paystub",
    documents,
    verified: state.paystubs.length >= 1 && Boolean(state.personal.firstName),
  };
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
    householdId: householdIdFromOccupants(state),
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
  const selfName = `${state.personal.firstName} ${state.personal.lastName}`.trim() || "Applicant";

  return {
    applicantId: localApplicantId(state.confirmationId ?? "draft"),
    dateOfBirth: state.personal.dateOfBirth,
    ssnLast4: ssnLast4(state.personal.ssn),
    desiredMoveIn: property?.availableDate ?? "",
    currentAddress: {
      address: state.rental?.currentResidence.address || fullAddress || "Not provided",
      since: state.rental?.currentResidence.from || "Not provided",
      monthlyRent: Number(state.rental?.currentResidence.monthlyRent) || 0,
      landlordName: state.rental?.currentResidence.landlordName || "Not provided",
      landlordPhone: state.rental?.currentResidence.landlordPhone || "Not provided",
      reasonForLeaving: state.rental?.currentResidence.reasonForLeaving || "Not provided",
    },
    employment: {
      employer: state.income.employer || state.rental?.currentEmployer.employer || "Not provided",
      position: state.income.position || state.rental?.currentEmployer.position || "Not provided",
      startDate: state.income.startDate || state.rental?.currentEmployer.from || "Not provided",
      supervisor: state.rental?.currentEmployer.supervisor || "Not provided",
      supervisorPhone: state.rental?.currentEmployer.supervisorPhone || "Not provided",
      monthlyIncome: Number(state.income.monthlyIncome.replace(/[^0-9.]/g, "")) || 0,
    },
    occupants: [
      { name: selfName, relationship: "Applicant", age: 0 },
      ...state.household.occupants.map((occupant) => ({
        name: occupant.name,
        relationship: householdIdFromOccupants(state)
          ? "Co-tenant"
          : occupant.relationship.trim() || "Occupant",
        age: Number(occupant.age) || 0,
      })),
    ],
    pets: state.household.pets.map((pet) => ({
      type: pet.type,
      breed: pet.breed,
      weight: pet.weight,
    })),
    vehicles: state.rental?.vehicle.make
      ? [
          {
            year: Number(state.rental.vehicle.year) || 0,
            make: state.rental.vehicle.make,
            model: state.rental.vehicle.model,
            plate: state.rental.vehicle.plate,
          },
        ]
      : [],
    disclosures: {
      smoker: state.household.smoker,
      priorEviction: state.household.priorEviction || Boolean(state.rental?.disclosures.unlawfulDetainer),
      bankruptcy: Boolean(state.rental?.disclosures.bankruptcy),
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
    aiIncome: mockAiIncome(state, monthlyIncome),
    residentialHistory: [],
  };
}
