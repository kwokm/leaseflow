import type { ScreeningPackage } from "@/lib/data/mock-data";

export const APPLY_STATE_VERSION = 2;

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
