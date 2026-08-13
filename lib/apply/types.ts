import type { ScreeningPackage } from "@/lib/data/mock-data";

export const APPLY_STATE_VERSION = 3;

/**
 * A file the renter picked in the browser. `url` is an object URL that only
 * lives for the current page session — nothing is uploaded anywhere, so after a
 * reload we keep the metadata and drop the preview.
 */
export interface LocalFile {
  id: string;
  name: string;
  size: number;
  mime: string;
  url?: string;
  addedAt: string;
}

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  ssn: string;
  street: string;
  unit: string;
  city: string;
  state: string;
  zip: string;
}

export interface IncomeInfo {
  employer: string;
  position: string;
  monthlyIncome: string;
  startDate: string;
  otherIncome: string;
}

export interface BankInfo {
  bankName: string;
  accountLast4: string;
}

export type ExperianStatus = "idle" | "authorizing" | "pulling" | "connected" | "skipped";

export interface ExperianState {
  status: ExperianStatus;
  score?: number;
  scoreModel?: string;
  pulledAt?: string;
  onTimePaymentRate?: number;
  openAccounts?: number;
  oldestAccountYears?: number;
  recentInquiries?: number;
  publicRecords?: number;
  factors?: string[];
}

export interface PetEntry {
  id: string;
  type: string;
  breed: string;
  weight: string;
}

export interface OccupantEntry {
  id: string;
  name: string;
  relationship: string;
  age: string;
}

export interface HouseholdInfo {
  pets: PetEntry[];
  occupants: OccupantEntry[];
  smoker: boolean;
  priorEviction: boolean;
  notes: string;
}

export interface ConsentInfo {
  fcra: boolean;
  backgroundAck: boolean;
  signature: string;
  acceptedAt?: string;
}

export interface PaymentInfo {
  cardName: string;
  cardNumber: string;
  expiry: string;
  cvc: string;
  billingZip: string;
}

export interface ApplyState {
  version: number;
  listingId: string;
  step: number;
  furthestStep: number;
  screeningPackage: ScreeningPackage;
  personal: PersonalInfo;
  idFront: LocalFile | null;
  idBack: LocalFile | null;
  income: IncomeInfo;
  paystubs: LocalFile[];
  bank: BankInfo;
  statements: LocalFile[];
  experian: ExperianState;
  household: HouseholdInfo;
  consent: ConsentInfo;
  payment: PaymentInfo;
  submittedAt?: string;
  confirmationId?: string;
}

export interface StepDefinition {
  id: number;
  key: string;
  name: string;
  title: string;
  lead: string;
  tone: string;
}

/** The nine steps of the renter application. */
export const APPLY_STEPS: StepDefinition[] = [
  {
    id: 1,
    key: "start",
    name: "Start",
    title: "Start your application",
    lead: "Pick a screening package",
    tone: "your credit report is included.",
  },
  {
    id: 2,
    key: "you",
    name: "You",
    title: "About you",
    lead: "Tell us who you are",
    tone: "sensitive fields stay masked.",
  },
  {
    id: 3,
    key: "id",
    name: "Photo ID",
    title: "Photo ID",
    lead: "Add the front and back",
    tone: "images or PDFs both work.",
  },
  {
    id: 4,
    key: "income",
    name: "Income",
    title: "Income",
    lead: "Where your income comes from",
    tone: "plus your two most recent pay stubs.",
  },
  {
    id: 5,
    key: "bank",
    name: "Bank",
    title: "Bank statements",
    lead: "Attach one to three statements",
    tone: "most recent months first.",
  },
  {
    id: 6,
    key: "credit",
    name: "Credit",
    title: "Credit report",
    lead: "Connect with Experian",
    tone: "no cost, and it never affects your score.",
  },
  {
    id: 7,
    key: "household",
    name: "Household",
    title: "Household",
    lead: "Pets and occupants",
    tone: "optional, but it speeds up review.",
  },
  {
    id: 8,
    key: "review",
    name: "Review",
    title: "Review and pay",
    lead: "Check everything over",
    tone: "then authorize and pay.",
  },
  {
    id: 9,
    key: "done",
    name: "Done",
    title: "Application submitted",
    lead: "You're all set",
    tone: "here is your receipt.",
  },
];

export const TOTAL_STEPS = APPLY_STEPS.length;

function dummyFile(name: string, mime: string, size: number): LocalFile {
  return {
    id: `demo-${name}`,
    name,
    size,
    mime,
    addedAt: "2026-08-01T12:00:00.000Z",
  };
}

/** Empty draft — kept for tests and as the merge base. */
export function createInitialState(listingId: string, pkg: ScreeningPackage): ApplyState {
  return {
    version: APPLY_STATE_VERSION,
    listingId,
    step: 1,
    furthestStep: 1,
    screeningPackage: pkg,
    personal: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      ssn: "",
      street: "",
      unit: "",
      city: "",
      state: "",
      zip: "",
    },
    idFront: null,
    idBack: null,
    income: {
      employer: "",
      position: "",
      monthlyIncome: "",
      startDate: "",
      otherIncome: "",
    },
    paystubs: [],
    bank: { bankName: "", accountLast4: "" },
    statements: [],
    experian: { status: "idle" },
    household: {
      pets: [],
      occupants: [],
      smoker: false,
      priorEviction: false,
      notes: "",
    },
    consent: { fcra: false, backgroundAck: false, signature: "" },
    payment: {
      cardName: "",
      cardNumber: "",
      expiry: "",
      cvc: "",
      billingZip: "",
    },
  };
}

/**
 * Preloaded Jane Doe packet so the prototype can be clicked through
 * without typing. Files have metadata only — previews clear on reload.
 */
export function createDemoState(listingId: string, pkg: ScreeningPackage): ApplyState {
  return {
    version: APPLY_STATE_VERSION,
    listingId,
    step: 1,
    furthestStep: TOTAL_STEPS,
    screeningPackage: pkg,
    personal: {
      firstName: "Jane",
      lastName: "Doe",
      email: "jane.doe@leaseflow.dev",
      phone: "(555) 010-0142",
      dateOfBirth: "04/12/1994",
      ssn: "123-45-6789",
      street: "88 Pine Court",
      unit: "2A",
      city: "San Francisco",
      state: "CA",
      zip: "94102",
    },
    idFront: dummyFile("demo-id-front.png", "image/png", 184320),
    idBack: dummyFile("demo-id-back.png", "image/png", 176128),
    income: {
      employer: "LeaseFlow Demo Co",
      position: "Product designer",
      monthlyIncome: "8500",
      startDate: "03/2022",
      otherIncome: "",
    },
    paystubs: [
      dummyFile("paystub-june-2026.pdf", "application/pdf", 98240),
      dummyFile("paystub-july-2026.pdf", "application/pdf", 101376),
    ],
    bank: { bankName: "First Republic Demo", accountLast4: "4421" },
    statements: [
      dummyFile("statement-june-2026.pdf", "application/pdf", 220160),
      dummyFile("statement-july-2026.pdf", "application/pdf", 214016),
    ],
    experian: {
      status: "connected",
      score: 720,
      scoreModel: "VantageScore 3.0 (demo)",
      pulledAt: "2026-08-01T12:10:00.000Z",
      onTimePaymentRate: 99,
      openAccounts: 8,
      oldestAccountYears: 7,
      recentInquiries: 1,
      publicRecords: 0,
      factors: [
        "No missed payments reported in the last 24 months",
        "Revolving utilization in the low 30% range",
      ],
    },
    household: {
      pets: [],
      occupants: [],
      smoker: false,
      priorEviction: false,
      notes: "No additional occupants. Quiet household.",
    },
    consent: {
      fcra: true,
      backgroundAck: true,
      signature: "Jane Doe",
    },
    payment: {
      cardName: "Jane Doe",
      cardNumber: "4242424242424242",
      expiry: "12/28",
      cvc: "123",
      billingZip: "94102",
    },
  };
}
