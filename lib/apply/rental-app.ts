import {
  FEATURED_LISTING_ID,
  getApplicantById,
  getApplicationDetails,
  getPropertyById,
  getReportByApplicant,
  getScreeningFee,
  type Applicant,
  type ApplicationDetails,
  type Property,
} from "@/lib/data/mock-data";
import { loadDraft, loadSubmissions } from "@/lib/apply/storage";
import { isLocalApplicantId, confirmationIdFromApplicantId } from "@/lib/apply/to-packet";
import { maskSsn } from "@/lib/apply/format";
import {
  createDemoState,
  demoRentalProfile,
  type ApplyState,
  type ContactRecord,
  type EmployerRecord,
  type ResidenceRecord,
  type RentalProfile,
} from "@/lib/apply/types";
import { TENANT_APPLICANT_ID } from "@/lib/tenant/session";

export type RentalApplication = {
  id: string;
  applicantId: string;
  listingId: string;
  generatedAt: string;
  completingAs: "tenant";
  totalApplicants: number;
  premises: {
    address: string;
    rent: number;
    moveIn: string;
    photos: string[];
  };
  personal: {
    fullName: string;
    dateOfBirth: string;
    license: string;
    mobile: string;
    workPhone: string;
    email: string;
    occupants: string;
    pets: string;
    vehicle: string;
    emergency: string;
  };
  disclosures: { label: string; value: "Yes" | "No" }[];
  residences: { title: string; lines: [string, string][] }[];
  employment: { title: string; lines: [string, string][] }[];
  otherIncome: string;
  creditors: [string, string][];
  bank: [string, string][];
  references: [string, string][];
  relatives: [string, string][];
  acknowledgments: string[];
  signature: string;
  signedAt: string;
  screeningFee: {
    packageLabel: string;
    amount: string;
    status: string;
    note: string;
  };
  ssnDisplay: string;
  noticeTitle: string;
  noticeBody: string;
};

function yesNo(value: boolean): "Yes" | "No" {
  return value ? "Yes" : "No";
}

function money(value: string | number): string {
  const amount = typeof value === "number" ? value : Number(String(value).replace(/[^0-9.]/g, ""));
  if (!amount) return "—";
  return `$${amount.toLocaleString()}`;
}

function joinContact(contact: ContactRecord): string {
  return [contact.name, contact.relationship, contact.phone, contact.address, contact.yearsKnown ? `${contact.yearsKnown} yrs` : ""]
    .filter(Boolean)
    .join(" · ");
}

function residenceLines(record: ResidenceRecord): [string, string][] {
  return [
    ["Address", record.address || "—"],
    ["Dates", [record.from, record.to].filter(Boolean).join(" – ") || "—"],
    ["Landlord", record.landlordName || "—"],
    ["Landlord phone", record.landlordPhone || "—"],
    ["Rent", money(record.monthlyRent)],
    ["Own?", yesNo(record.owned)],
    ["Reason for leaving", record.reasonForLeaving || "—"],
  ];
}

function employerLines(record: EmployerRecord): [string, string][] {
  return [
    ["Employer", record.employer || "—"],
    ["Position", record.position || "—"],
    ["Dates", [record.from, record.to].filter(Boolean).join(" – ") || "—"],
    ["Supervisor", record.supervisor || "—"],
    ["Supervisor phone", record.supervisorPhone || "—"],
    ["Gross monthly income", money(record.monthlyIncome)],
  ];
}

function filledAt(state?: ApplyState, details?: ApplicationDetails): string {
  return (
    state?.submittedAt ||
    state?.consent.acceptedAt ||
    details?.consent.acceptedAt ||
    "2026-08-14T12:00:00.000Z"
  );
}

export function buildRentalApplication(input: {
  id: string;
  applicant: Applicant;
  property: Property;
  state?: ApplyState;
  details?: ApplicationDetails;
}): RentalApplication {
  const { id, applicant, property, state, details } = input;
  const rental: RentalProfile = state?.rental ?? demoRentalProfile();
  const fullName = `${state?.personal.firstName ?? applicant.firstName} ${state?.personal.lastName ?? applicant.lastName}`.trim();
  const occupants = state?.household.occupants.length
    ? state.household.occupants.map((row) => `${row.name} (${row.relationship}, ${row.age})`).join("; ")
    : details?.occupants.filter((row) => row.relationship !== "Applicant").length
      ? details.occupants
          .filter((row) => row.relationship !== "Applicant")
          .map((row) => `${row.name} (${row.relationship}, ${row.age})`)
          .join("; ")
      : "None";
  const pets = state?.household.pets.length
    ? state.household.pets.map((pet) => [pet.type, pet.breed, pet.weight].filter(Boolean).join(" ")).join("; ")
    : details?.pets.length
      ? details.pets.map((pet) => [pet.type, pet.breed, pet.weight].filter(Boolean).join(" ")).join("; ")
      : "None";
  const vehicle = [rental.vehicle.year, rental.vehicle.make, rental.vehicle.model, rental.vehicle.plate]
    .filter(Boolean)
    .join(" ");
  const fee = getScreeningFee(state?.screeningPackage ?? property.screeningPackage);
  const pkg = state?.screeningPackage ?? property.screeningPackage;
  const signed = state?.consent.signature || details?.consent.signature || fullName;
  const signedAt = filledAt(state, details);
  const ssn = state?.personal.ssn ? maskSsn(state.personal.ssn) : details?.ssnLast4 ? `•••-••-${details.ssnLast4}` : "—";

  return {
    id,
    applicantId: applicant.id,
    listingId: property.id,
    generatedAt: new Date().toISOString(),
    completingAs: "tenant",
    totalApplicants: rental.totalApplicants || 1,
    premises: {
      address: property.address,
      rent: property.rent,
      moveIn: details?.desiredMoveIn || property.availableDate || "2026-09-01",
      photos: property.photos ?? [],
    },
    personal: {
      fullName,
      dateOfBirth: state?.personal.dateOfBirth || details?.dateOfBirth || "—",
      license: [rental.license.number, rental.license.state, rental.license.expires ? `exp ${rental.license.expires}` : ""]
        .filter(Boolean)
        .join(" · ") || "—",
      mobile: state?.personal.phone || applicant.phone,
      workPhone: rental.workPhone || "—",
      email: state?.personal.email || applicant.email,
      occupants,
      pets,
      vehicle: vehicle || "—",
      emergency: joinContact(rental.emergency) || "—",
    },
    disclosures: [
      ["Water-filled furniture", rental.disclosures.liquidFurniture],
      ["Unlawful detainer / eviction", rental.disclosures.unlawfulDetainer || Boolean(state?.household.priorEviction || details?.disclosures.priorEviction)],
      ["Bankruptcy", rental.disclosures.bankruptcy || Boolean(details?.disclosures.bankruptcy)],
      ["Asked to move out", rental.disclosures.askedToMoveOut],
      ["Felony conviction", rental.disclosures.felony],
    ].map(([label, value]) => ({ label: String(label), value: yesNo(Boolean(value)) })),
    residences: [
      { title: "Current", lines: residenceLines(rental.currentResidence) },
      { title: "Previous", lines: residenceLines(rental.previousResidence) },
    ],
    employment: [
      { title: "Current", lines: employerLines(syncCurrentEmployer(rental.currentEmployer, state, details)) },
      { title: "Previous", lines: employerLines(rental.previousEmployer) },
    ],
    otherIncome: rental.otherIncomeSource
      ? `${rental.otherIncomeSource} · ${money(rental.otherIncomeAmount)}`
      : "None",
    creditors: rental.creditors.map((row) => [row.name, `${row.accountType} · ${money(row.balance)}`]),
    bank: [
      ["Bank / branch", [rental.bankAccount.bank || state?.bank.bankName, rental.bankAccount.branch].filter(Boolean).join(" · ") || "—"],
      ["Account", `${rental.bankAccount.accountType || "Checking"} ·•••${rental.bankAccount.last4 || state?.bank.accountLast4 || "••••"}`],
      ["Balance", money(rental.bankAccount.balance)],
    ],
    references: rental.references.map((row) => [row.name, joinContact({ ...row, name: "" }).replace(/^ · /, "")]),
    relatives: rental.relatives.map((row) => [row.name, joinContact({ ...row, name: "" }).replace(/^ · /, "")]),
    acknowledgments: [
      "Applicant-pays screening through LeaseFlow (prototype).",
      "Background-check notice acknowledged.",
      "Information is true and complete to the best of the applicant’s knowledge.",
    ],
    signature: signed,
    signedAt,
    screeningFee: {
      packageLabel: pkg === "premium" ? "Premium" : "Standard",
      amount: `$${fee.toFixed(2)}`,
      status: state?.submittedAt ? "Paid" : "Collected when the packet is submitted",
      note: "Applicant pays. Landlord does not collect this fee. Prototype checkout — no card is charged.",
    },
    ssnDisplay: ssn === "—" ? "Not collected on this form" : ssn,
    noticeTitle: "Background check notice",
    noticeBody:
      "The landlord may obtain a consumer report and a public-records background search in connection with this rental. That may include credit, eviction, and criminal-history information from a consumer reporting agency. This page is a short prototype notice — it is not a C.A.R. form and no agency is contacted in this demo. If a live report later leads to an adverse decision, the applicant would receive a notice identifying the agency and explaining dispute rights.",
  };
}

function syncCurrentEmployer(
  seeded: EmployerRecord,
  state?: ApplyState,
  details?: ApplicationDetails,
): EmployerRecord {
  return {
    ...seeded,
    employer: state?.income.employer || details?.employment.employer || seeded.employer,
    position: state?.income.position || details?.employment.position || seeded.position,
    from: state?.income.startDate || details?.employment.startDate || seeded.from,
    monthlyIncome: state?.income.monthlyIncome || String(details?.employment.monthlyIncome ?? "") || seeded.monthlyIncome,
    supervisor: details?.employment.supervisor || seeded.supervisor,
    supervisorPhone: details?.employment.supervisorPhone || seeded.supervisorPhone,
  };
}

export function rentalApplicationFromState(state: ApplyState, property: Property): RentalApplication {
  const applicant: Applicant = {
    id: state.confirmationId ? `local-${state.confirmationId}` : TENANT_APPLICANT_ID,
    propertyId: property.id,
    status: state.submittedAt ? "completed" : "in_progress",
    firstName: state.personal.firstName,
    lastName: state.personal.lastName,
    email: state.personal.email,
    phone: state.personal.phone,
    appliedAt: state.submittedAt ?? new Date().toISOString(),
  };
  return buildRentalApplication({
    id: applicant.id,
    applicant,
    property,
    state,
  });
}

export function resolveRentalPacket(id: string): {
  application: RentalApplication;
  applicant: Applicant;
  property: Property;
  details?: ApplicationDetails;
  state?: ApplyState;
} | null {
  const listingAlias = id === "resh-510" || id === FEATURED_LISTING_ID || id === "jane";
  const applicantId = listingAlias ? TENANT_APPLICANT_ID : id;

  if (isLocalApplicantId(applicantId) && typeof window !== "undefined") {
    const submission = loadSubmissions().find(
      (entry) => entry.confirmationId === confirmationIdFromApplicantId(applicantId),
    );
    if (submission) {
      const property = getPropertyById(submission.listingId) ?? getPropertyById(FEATURED_LISTING_ID);
      if (!property) return null;
      return {
        application: rentalApplicationFromState(submission, property),
        applicant: {
          id: applicantId,
          propertyId: property.id,
          status: "completed",
          firstName: submission.personal.firstName,
          lastName: submission.personal.lastName,
          email: submission.personal.email,
          phone: submission.personal.phone,
          appliedAt: submission.submittedAt ?? new Date().toISOString(),
        },
        property,
        state: submission,
      };
    }
  }

  const applicant = getApplicantById(applicantId) ?? getApplicantById(TENANT_APPLICANT_ID);
  if (!applicant) return null;
  const property = getPropertyById(applicant.propertyId) ?? getPropertyById(FEATURED_LISTING_ID);
  if (!property) return null;
  const details = getApplicationDetails(applicant.id);
  const report = getReportByApplicant(applicant.id);

  let state: ApplyState | undefined;
  if (typeof window !== "undefined" && applicant.id === TENANT_APPLICANT_ID) {
    state = loadDraft(property.id, property.screeningPackage);
  }

  const application = state
    ? rentalApplicationFromState(state, property)
    : buildRentalApplication({
        id: applicant.id,
        applicant,
        property,
        details,
        state: synthesizeState(applicant, property, details, report?.residentialHistory),
      });

  return { application, applicant, property, details, state };
}

function synthesizeState(
  applicant: Applicant,
  property: Property,
  details?: ApplicationDetails,
  history?: { address: string; from: string; to: string; landlordVerified: boolean }[],
): ApplyState {
  const base = createDemoState(property.id, property.screeningPackage);
  const previous = history?.[1];
  return {
    ...base,
    listingId: property.id,
    personal: {
      ...base.personal,
      firstName: applicant.firstName,
      lastName: applicant.lastName,
      email: applicant.email,
      phone: applicant.phone,
      dateOfBirth: details?.dateOfBirth ?? base.personal.dateOfBirth,
    },
    income: {
      ...base.income,
      employer: details?.employment.employer ?? base.income.employer,
      position: details?.employment.position ?? base.income.position,
      monthlyIncome: details ? String(details.employment.monthlyIncome) : base.income.monthlyIncome,
      startDate: details?.employment.startDate ?? base.income.startDate,
    },
    household: {
      ...base.household,
      pets: details?.pets.map((pet, index) => ({ id: `pet-${index}`, ...pet })) ?? [],
      occupants:
        details?.occupants
          .filter((row) => row.relationship !== "Applicant")
          .map((row, index) => ({
            id: `occ-${index}`,
            name: row.name,
            relationship: row.relationship,
            age: String(row.age),
          })) ?? [],
      priorEviction: details?.disclosures.priorEviction ?? false,
    },
    consent: {
      ...base.consent,
      signature: details?.consent.signature || `${applicant.firstName} ${applicant.lastName}`,
      acceptedAt: details?.consent.acceptedAt,
    },
    rental: {
      ...base.rental,
      currentResidence: details
        ? {
            address: details.currentAddress.address,
            from: details.currentAddress.since,
            to: "Present",
            landlordName: details.currentAddress.landlordName,
            landlordPhone: details.currentAddress.landlordPhone,
            monthlyRent: String(details.currentAddress.monthlyRent),
            owned: false,
            reasonForLeaving: details.currentAddress.reasonForLeaving,
          }
        : base.rental.currentResidence,
      previousResidence: previous
        ? {
            address: previous.address,
            from: previous.from,
            to: previous.to,
            landlordName: "Prior landlord",
            landlordPhone: "—",
            monthlyRent: "",
            owned: false,
            reasonForLeaving: "—",
          }
        : base.rental.previousResidence,
      currentEmployer: details
        ? {
            employer: details.employment.employer,
            position: details.employment.position,
            from: details.employment.startDate,
            to: "Present",
            supervisor: details.employment.supervisor,
            supervisorPhone: details.employment.supervisorPhone,
            monthlyIncome: String(details.employment.monthlyIncome),
          }
        : base.rental.currentEmployer,
      vehicle: details?.vehicles[0]
        ? {
            year: String(details.vehicles[0].year),
            make: details.vehicles[0].make,
            model: details.vehicles[0].model,
            plate: details.vehicles[0].plate,
          }
        : base.rental.vehicle,
      emergency: {
        name: `${applicant.lastName} household`,
        relationship: "Emergency",
        phone: applicant.phone,
      },
      references: [
        {
          name: details?.employment.supervisor || "Supervisor",
          relationship: "Supervisor",
          phone: details?.employment.supervisorPhone || applicant.phone,
          yearsKnown: "3",
        },
        base.rental.references[1],
      ],
      relatives: base.rental.relatives.map((row) => ({
        ...row,
        name: row.name.replace("Doe", applicant.lastName),
      })),
      disclosures: {
        ...base.rental.disclosures,
        bankruptcy: details?.disclosures.bankruptcy ?? false,
        unlawfulDetainer: details?.disclosures.priorEviction ?? false,
      },
    },
  };
}

export function packetSharePath(id: string): string {
  return `/packet/${id}`;
}
