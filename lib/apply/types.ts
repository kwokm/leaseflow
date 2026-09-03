import type { ScreeningPackage } from "@/lib/data/mock-data";
import { CREDIT_DISCLOSURE_BODY, FCRA_PACK_VERSION } from "@/lib/legal/fcra";

export const APPLY_STATE_VERSION = 9;

/**
 * A file the renter attached.
 *
 * `storedUrl` is the durable Blob URL and survives reloads. `url` is a local
 * object URL used for an instant preview before the upload finishes (and as the
 * only preview when Blob storage is not configured); it is per-session, so it is
 * dropped when a draft is rehydrated.
 */
export interface LocalFile {
  id: string;
  name: string;
  size: number;
  mime: string;
  url?: string;
  storedUrl?: string;
  pathname?: string;
  /** Neon income_checks id, set after the apply flow enqueues a Studio job. */
  incomeCheckId?: string;
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

/**
 * `authorized` is the resting state under charge-then-screen: the applicant has
 * permissioned the Experian Connect share, but the report is not requested until
 * the $24.99 fee is captured. `connected` means a summary has come back.
 */
export type ExperianStatus =
  | "idle"
  | "authorizing"
  | "authorized"
  | "pulling"
  | "connected"
  | "skipped";

export interface ExperianState {
  status: ExperianStatus;
  /** Opaque Connect share reference. Never a credential, never the report. */
  shareReference?: string;
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
  checkboxAuth: boolean;
  checkboxUse: boolean;
  typedFullName: string;
  /** Mirrors typedFullName so existing packet/rental-app surfaces keep working. */
  signature: string;
  acceptedAt?: string;
  consentId?: string;
  copyVersion?: string;
  copySha256?: string;
  disclosureText?: string;
  recipientName?: string;
  locale?: string;
  declined?: boolean;
}

/**
 * Card details are collected by Stripe Checkout on Stripe's own page — they
 * never touch this app, so this only tracks where the applicant is in the
 * hand-off.
 */
export type PaymentStage = "unpaid" | "redirecting" | "paid";

export interface PaymentState {
  stage: PaymentStage;
  checkoutSessionId?: string;
  paidAt?: string;
  /** Set when Stripe is not configured and the demo flow skipped the charge. */
  demoSkipped?: boolean;
}

export interface LicenseInfo {
  number: string;
  state: string;
  expires: string;
}

export interface ResidenceRecord {
  address: string;
  from: string;
  to: string;
  landlordName: string;
  landlordPhone: string;
  monthlyRent: string;
  owned: boolean;
  reasonForLeaving: string;
}

export interface EmployerRecord {
  employer: string;
  position: string;
  from: string;
  to: string;
  supervisor: string;
  supervisorPhone: string;
  monthlyIncome: string;
}

export interface CreditorRecord {
  name: string;
  accountType: string;
  balance: string;
}

export interface BankAccountRecord {
  bank: string;
  branch: string;
  accountType: string;
  last4: string;
  balance: string;
}

export interface ContactRecord {
  name: string;
  relationship: string;
  phone: string;
  address?: string;
  yearsKnown?: string;
}

export interface VehicleRecord {
  year: string;
  make: string;
  model: string;
  plate: string;
}

export interface RentalDisclosures {
  liquidFurniture: boolean;
  unlawfulDetainer: boolean;
  bankruptcy: boolean;
  askedToMoveOut: boolean;
  felony: boolean;
}

/** Extra Application to Rent fields not collected as their own wizard steps. */
export interface RentalProfile {
  completingAs: "tenant";
  totalApplicants: number;
  workPhone: string;
  license: LicenseInfo;
  emergency: ContactRecord;
  vehicle: VehicleRecord;
  currentResidence: ResidenceRecord;
  previousResidence: ResidenceRecord;
  currentEmployer: EmployerRecord;
  previousEmployer: EmployerRecord;
  otherIncomeSource: string;
  otherIncomeAmount: string;
  creditors: CreditorRecord[];
  bankAccount: BankAccountRecord;
  references: ContactRecord[];
  relatives: ContactRecord[];
  disclosures: RentalDisclosures;
}

export const SOCIAL_NETWORKS = ["instagram", "tiktok", "facebook"] as const;
export type SocialNetwork = (typeof SOCIAL_NETWORKS)[number];

export const BIO_MAX_CHARS = 400;

/** Landlord-safe post tile. Never includes tokens. */
export type SocialPostView = {
  network: SocialNetwork;
  position: number;
  permalink: string;
  caption: string;
  takenAt: string | null;
  thumbUrl?: string;
  mediaType: string;
};

export type SocialAccountView = {
  network: SocialNetwork;
  profileUrl: string;
  handle: string;
  connected: boolean;
  /** True when Facebook returned a personal profile with no Page — link only. */
  personalProfile?: boolean;
  posts: SocialPostView[];
};

export interface ApplicantBio {
  photo: LocalFile | null;
  text: string;
  socialConsent: boolean;
  socialConsentAt?: string;
  /** Client draft key so OAuth can attach snapshots before submit. */
  draftId: string;
  social: Record<SocialNetwork, SocialAccountView>;
}

export function emptySocialAccount(network: SocialNetwork): SocialAccountView {
  return { network, profileUrl: "", handle: "", connected: false, posts: [] };
}

export function emptyApplicantBio(): ApplicantBio {
  return {
    photo: null,
    text: "",
    socialConsent: false,
    draftId: "",
    social: {
      instagram: emptySocialAccount("instagram"),
      tiktok: emptySocialAccount("tiktok"),
      facebook: emptySocialAccount("facebook"),
    },
  };
}

export interface ApplyState {
  version: number;
  listingId: string;
  step: number;
  furthestStep: number;
  screeningPackage: ScreeningPackage;
  personal: PersonalInfo;
  bio: ApplicantBio;
  idFront: LocalFile | null;
  idBack: LocalFile | null;
  income: IncomeInfo;
  paystubs: LocalFile[];
  bank: BankInfo;
  statements: LocalFile[];
  experian: ExperianState;
  household: HouseholdInfo;
  consent: ConsentInfo;
  payment: PaymentState;
  rental: RentalProfile;
  /** Server-side application id, set once the packet is written to Neon. */
  applicationId?: string;
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

/** Four visible stages (You · Proof · Credit · Pay) plus a receipt that is not in the stepper. */
export const APPLY_STEP = {
  you: 1,
  proof: 2,
  credit: 3,
  pay: 4,
  done: 5,
} as const;

export type ApplyStepId = (typeof APPLY_STEP)[keyof typeof APPLY_STEP];

export const APPLY_STEPS: StepDefinition[] = [
  {
    id: APPLY_STEP.you,
    key: "you",
    name: "You",
    title: "About you",
    lead: "Tell us who you are",
    tone: "listing, identity, and household.",
  },
  {
    id: APPLY_STEP.proof,
    key: "proof",
    name: "Proof",
    title: "Proof",
    lead: "Photo ID, income, and bank",
    tone: "uploads are stored securely for this application.",
  },
  {
    id: APPLY_STEP.credit,
    key: "credit",
    name: "Credit",
    title: "Share your Experian report",
    lead: "Share your Experian report",
    tone: "authenticate, then share with this landlord.",
  },
  {
    id: APPLY_STEP.pay,
    key: "pay",
    name: "Pay",
    title: "Review and pay",
    lead: "Check everything over",
    tone: "then authorize and pay.",
  },
  {
    id: APPLY_STEP.done,
    key: "done",
    name: "Done",
    title: "Application submitted",
    lead: "You're all set",
    tone: "here is your receipt.",
  },
];

/** Visible stepper — Done is the completion screen after Pay, not a fifth rail item. */
export const APPLY_STEPPER = APPLY_STEPS.filter((step) => step.key !== "done");

export const TOTAL_STEPS = APPLY_STEPS.length;

export function emptyResidence(): ResidenceRecord {
  return {
    address: "",
    from: "",
    to: "",
    landlordName: "",
    landlordPhone: "",
    monthlyRent: "",
    owned: false,
    reasonForLeaving: "",
  };
}

export function emptyEmployer(): EmployerRecord {
  return {
    employer: "",
    position: "",
    from: "",
    to: "",
    supervisor: "",
    supervisorPhone: "",
    monthlyIncome: "",
  };
}

export function emptyRentalProfile(): RentalProfile {
  return {
    completingAs: "tenant",
    totalApplicants: 1,
    workPhone: "",
    license: { number: "", state: "", expires: "" },
    emergency: { name: "", relationship: "", phone: "" },
    vehicle: { year: "", make: "", model: "", plate: "" },
    currentResidence: emptyResidence(),
    previousResidence: emptyResidence(),
    currentEmployer: emptyEmployer(),
    previousEmployer: emptyEmployer(),
    otherIncomeSource: "",
    otherIncomeAmount: "",
    creditors: [],
    bankAccount: { bank: "", branch: "", accountType: "", last4: "", balance: "" },
    references: [],
    relatives: [],
    disclosures: {
      liquidFurniture: false,
      unlawfulDetainer: false,
      bankruptcy: false,
      askedToMoveOut: false,
      felony: false,
    },
  };
}

export function demoRentalProfile(): RentalProfile {
  return {
    completingAs: "tenant",
    totalApplicants: 1,
    workPhone: "(555) 010-2200",
    license: { number: "D1234567", state: "CA", expires: "04/12/2028" },
    emergency: { name: "Nora Doe", relationship: "Sister", phone: "(555) 010-0190" },
    vehicle: { year: "2021", make: "Honda", model: "Civic", plate: "CA 8JANE" },
    currentResidence: {
      address: "88 Pine Court 2A, San Francisco, CA 94102",
      from: "03/2022",
      to: "Present",
      landlordName: "Pine Court LLC",
      landlordPhone: "(555) 010-2201",
      monthlyRent: "3200",
      owned: false,
      reasonForLeaving: "Relocating to Anaheim",
    },
    previousResidence: {
      address: "14 Valencia St, Oakland, CA 94612",
      from: "06/2019",
      to: "02/2022",
      landlordName: "Harbor Property",
      landlordPhone: "(510) 555-0144",
      monthlyRent: "2400",
      owned: false,
      reasonForLeaving: "Shorter commute",
    },
    currentEmployer: {
      employer: "Leaseproof Demo Co",
      position: "Product designer",
      from: "03/2022",
      to: "Present",
      supervisor: "Mina Alvarez",
      supervisorPhone: "(555) 010-0188",
      monthlyIncome: "8500",
    },
    previousEmployer: {
      employer: "Studio North",
      position: "Junior designer",
      from: "08/2019",
      to: "02/2022",
      supervisor: "Eli Park",
      supervisorPhone: "(415) 555-0177",
      monthlyIncome: "6200",
    },
    otherIncomeSource: "",
    otherIncomeAmount: "",
    creditors: [
      { name: "Chase Visa", accountType: "Revolving", balance: "1240" },
      { name: "Honda Financial", accountType: "Auto loan", balance: "8900" },
    ],
    bankAccount: {
      bank: "First Republic Demo",
      branch: "Mission",
      accountType: "Checking",
      last4: "4421",
      balance: "12400",
    },
    references: [
      { name: "Mina Alvarez", relationship: "Manager", phone: "(555) 010-0188", yearsKnown: "4" },
      { name: "Sam Ortiz", relationship: "Colleague", phone: "(415) 555-0162", yearsKnown: "5" },
    ],
    relatives: [
      {
        name: "Nora Doe",
        relationship: "Sister",
        phone: "(555) 010-0190",
        address: "210 Oak St, Oakland, CA 94612",
      },
      {
        name: "Robert Doe",
        relationship: "Father",
        phone: "(707) 555-0133",
        address: "9 Harbor Way, Santa Rosa, CA 95401",
      },
    ],
    disclosures: {
      liquidFurniture: false,
      unlawfulDetainer: false,
      bankruptcy: false,
      askedToMoveOut: false,
      felony: false,
    },
  };
}

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
    consent: { checkboxAuth: false, checkboxUse: false, typedFullName: "", signature: "" },
    payment: { stage: "unpaid" },
    rental: emptyRentalProfile(),
    bio: emptyApplicantBio(),
  };
}

/**
 * Preloaded Jane Doe packet so the flow can be clicked through
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
      employer: "Leaseproof Demo Co",
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
      checkboxAuth: true,
      checkboxUse: true,
      typedFullName: "Jane Doe",
      signature: "Jane Doe",
      acceptedAt: "2026-08-01T12:08:00.000Z",
      copyVersion: FCRA_PACK_VERSION,
      disclosureText: CREDIT_DISCLOSURE_BODY,
      recipientName: "this landlord",
      locale: "en-US",
    },
    payment: { stage: "unpaid" },
    rental: demoRentalProfile(),
    bio: {
      ...emptyApplicantBio(),
      text: "Designer relocating to Orange County. Quiet household, remote work, and weekends at the beach.",
    },
  };
}
