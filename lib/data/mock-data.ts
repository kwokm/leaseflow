import { mockApplicants, mockReports } from "./mock-applicants";
import { mockApplicationDetails } from "./mock-details";
import { mockExperianPulls, mockPayments, mockThreads } from "./mock-ledger";

// Mock data for Leaseproof demos and the landing-page preview

export type ApplicationStatus = "invited" | "in_progress" | "completed" | "approved" | "declined";

export type ScreeningPackage = "standard";

/** The single applicant-paid screening plan. */
export const STANDARD_SCREENING_FEE = 24.99;
export const STANDARD_PACKAGE_NAME = "Standard";
export const STANDARD_PRICING_STORY =
  "Applicants pay $24.99; Experian is included, $0 extra for landlords.";

export interface Property {
  id: string;
  address: string;
  rent: number;
  bedrooms: number;
  bathrooms: number;
  availableDate: string;
  screeningPackage: ScreeningPackage;
  applyUrl: string;
  createdAt: string;
  photos?: string[];
  sqft?: number;
  zillowUrl?: string;
  zpid?: string;
  neighborhood?: string;
  propertyType?: string;
}

export interface Applicant {
  id: string;
  propertyId: string;
  status: ApplicationStatus;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  appliedAt: string;
  completedAt?: string;
  leaseScore?: number;
}

export interface CreditSummary {
  leaseScore: number;
  paymentHistory: number;
  creditUtilization: number;
  totalAccounts: number;
  derogatoryMarks: number;
  hardInquiries: number;
}

export interface BackgroundCheck {
  criminal: "clear" | "records_found";
  eviction: "clear" | "records_found";
  sexOffender: "clear" | "records_found";
  details?: string;
}

export interface IncomeVerification {
  employer: string;
  position: string;
  monthlyIncome: number;
  verified: boolean;
}

export interface ScreeningReport {
  applicantId: string;
  credit: CreditSummary;
  background: BackgroundCheck;
  income: IncomeVerification;
  residentialHistory: {
    address: string;
    from: string;
    to: string;
    landlordVerified: boolean;
  }[];
}

/**
 * Result of the mock Experian connection in the apply flow. Everything here is
 * fabricated locally — Leaseproof never contacts a consumer reporting agency
 * and never collects bureau login details.
 */
export interface ExperianPull {
  applicantId: string;
  provider: "Experian (demo)";
  status: "connected";
  score: number;
  scoreModel: string;
  pulledAt: string;
  fileMatched: boolean;
  onTimePaymentRate: number;
  openAccounts: number;
  oldestAccountYears: number;
  recentInquiries: number;
  publicRecords: number;
  factors: string[];
}

export type DocumentType =
  | "photo_id_front"
  | "photo_id_back"
  | "paystub"
  | "bank_statement"
  | "w2"
  | "form_1099"
  | "portfolio"
  | "investment"
  | "other";

export interface ApplicationDocument {
  name: string;
  kind: string;
  docType: DocumentType;
  uploadedAt: string;
  sizeLabel?: string;
  previewAvailable?: boolean;
}

export const documentTypeLabels: Record<DocumentType, string> = {
  photo_id_front: "Photo ID — front",
  photo_id_back: "Photo ID — back",
  paystub: "Pay stub",
  bank_statement: "Bank statement",
  w2: "W-2",
  form_1099: "1099",
  portfolio: "Portfolio statement",
  investment: "Investment statement",
  other: "Other proof of income",
};

// Renter-submitted portion of an application, shown in the application packet
export interface ApplicationDetails {
  applicantId: string;
  dateOfBirth: string;
  ssnLast4: string;
  desiredMoveIn: string;
  currentAddress: {
    address: string;
    since: string;
    monthlyRent: number;
    landlordName: string;
    landlordPhone: string;
    reasonForLeaving: string;
  };
  employment: {
    employer: string;
    position: string;
    startDate: string;
    supervisor: string;
    supervisorPhone: string;
    monthlyIncome: number;
  };
  occupants: { name: string; relationship: string; age: number }[];
  pets: { type: string; breed: string; weight: string }[];
  vehicles: { year: number; make: string; model: string; plate: string }[];
  disclosures: {
    smoker: boolean;
    priorEviction: boolean;
    bankruptcy: boolean;
    notes?: string;
  };
  documents: ApplicationDocument[];
  consent: { acceptedAt: string; signature: string; ipAddress: string };
}

export type PaymentStatus = "paid" | "pending" | "refunded" | "failed";

export type PaymentKind = "screening_fee" | "holding_deposit" | "payout";

export interface Payment {
  id: string;
  kind: PaymentKind;
  description: string;
  applicantId?: string;
  propertyId?: string;
  amount: number;
  status: PaymentStatus;
  method: string;
  createdAt: string;
}

export interface Message {
  id: string;
  from: "landlord" | "applicant";
  body: string;
  sentAt: string;
}

export interface MessageThread {
  id: string;
  applicantId: string;
  propertyId: string;
  subject: string;
  unread: number;
  messages: Message[];
}

// Sample Properties
export const FEATURED_LISTING_ID = "resh-510";

/** Professional CRMLS photos for 170 Chorus, Irvine (MLS PW26166675). */
export const FEATURED_PHOTOS = [
      "https://d36xftgacqn2p.cloudfront.net/listingphotos25/PW26166675-1.jpg",
      "https://d36xftgacqn2p.cloudfront.net/listingphotos25/PW26166675-2.jpg",
      "https://d36xftgacqn2p.cloudfront.net/listingphotos25/PW26166675-5.jpg",
      "https://d36xftgacqn2p.cloudfront.net/listingphotos25/PW26166675-7.jpg",
      "https://d36xftgacqn2p.cloudfront.net/listingphotos25/PW26166675-10.jpg",
      "https://d36xftgacqn2p.cloudfront.net/listingphotos25/PW26166675-11.jpg",
      "https://d36xftgacqn2p.cloudfront.net/listingphotos25/PW26166675-12.jpg",
      "https://d36xftgacqn2p.cloudfront.net/listingphotos25/PW26166675-19.jpg",
] as const;

export const mockProperties: Property[] = [
  {
    id: "resh-510",
    address: "170 Chorus, Irvine, CA 92618",
    rent: 6500,
    bedrooms: 4,
    bathrooms: 3.5,
    availableDate: "2026-09-01",
    screeningPackage: "standard",
    applyUrl: "https://leaseflow.app/apply/resh-510",
    createdAt: "2026-08-01T10:00:00Z",
    photos: [...FEATURED_PHOTOS],
    sqft: 3010,
    zillowUrl: "https://www.zillow.com/homes/170-Chorus,-Irvine,-CA-92618_rb/",
    neighborhood: "Rise Park",
    propertyType: "House",
  },
  {
    id: "prop-1",
    address: "14 Modesto, Irvine, CA 92602",
    rent: 7000,
    bedrooms: 5,
    bathrooms: 4,
    availableDate: "2026-09-01",
    screeningPackage: "standard",
    applyUrl: "https://leaseflow.app/apply/prop-1",
    createdAt: "2026-07-15T10:00:00Z",
    photos: [
      "https://d36xftgacqn2p.cloudfront.net/listingphotos25/OC25098497-1.jpg",
      "https://d36xftgacqn2p.cloudfront.net/listingphotos25/OC25098497-3.jpg",
      "https://d36xftgacqn2p.cloudfront.net/listingphotos25/OC25098497-6.jpg",
      "https://d36xftgacqn2p.cloudfront.net/listingphotos25/OC25098497-9.jpg",
      "https://d36xftgacqn2p.cloudfront.net/listingphotos25/OC25098497-10.jpg",
      "https://d36xftgacqn2p.cloudfront.net/listingphotos25/OC25098497-11.jpg",
      "https://d36xftgacqn2p.cloudfront.net/listingphotos25/OC25098497-12.jpg",
      "https://d36xftgacqn2p.cloudfront.net/listingphotos25/OC25098497-15.jpg",
    ],
    sqft: 3250,
    zillowUrl: "https://www.zillow.com/homes/14-Modesto,-Irvine,-CA-92602_rb/",
    neighborhood: "Northpark",
    propertyType: "House",
  },
  {
    id: "prop-2",
    address: "66 Diamond Flats, Irvine, CA 92602",
    rent: 6950,
    bedrooms: 4,
    bathrooms: 3.5,
    availableDate: "2026-08-15",
    screeningPackage: "standard",
    applyUrl: "https://leaseflow.app/apply/prop-2",
    createdAt: "2026-07-20T14:30:00Z",
    photos: [
      "https://d36xftgacqn2p.cloudfront.net/listingphotos25/OC26175204-1.jpg",
      "https://d36xftgacqn2p.cloudfront.net/listingphotos25/OC26175204-2.jpg",
      "https://d36xftgacqn2p.cloudfront.net/listingphotos25/OC26175204-3.jpg",
      "https://d36xftgacqn2p.cloudfront.net/listingphotos25/OC26175204-6.jpg",
      "https://d36xftgacqn2p.cloudfront.net/listingphotos25/OC26175204-9.jpg",
      "https://d36xftgacqn2p.cloudfront.net/listingphotos25/OC26175204-10.jpg",
      "https://d36xftgacqn2p.cloudfront.net/listingphotos25/OC26175204-11.jpg",
      "https://d36xftgacqn2p.cloudfront.net/listingphotos25/OC26175204-12.jpg",
    ],
    sqft: 2719,
    zillowUrl: "https://www.zillow.com/homes/66-Diamond-Flats,-Irvine,-CA-92602_rb/",
    neighborhood: "Orchard Hills",
    propertyType: "House",
  },
  {
    id: "prop-3",
    address: "141 Dolores, Irvine, CA 92618",
    rent: 6498,
    bedrooms: 6,
    bathrooms: 4,
    availableDate: "2026-10-01",
    screeningPackage: "standard",
    applyUrl: "https://leaseflow.app/apply/prop-3",
    createdAt: "2026-08-01T09:15:00Z",
    photos: [
      "https://d36xftgacqn2p.cloudfront.net/listingphotos25/OC26165709-1.jpg",
      "https://d36xftgacqn2p.cloudfront.net/listingphotos25/OC26165709-2.jpg",
      "https://d36xftgacqn2p.cloudfront.net/listingphotos25/OC26165709-3.jpg",
      "https://d36xftgacqn2p.cloudfront.net/listingphotos25/OC26165709-4.jpg",
      "https://d36xftgacqn2p.cloudfront.net/listingphotos25/OC26165709-5.jpg",
      "https://d36xftgacqn2p.cloudfront.net/listingphotos25/OC26165709-6.jpg",
      "https://d36xftgacqn2p.cloudfront.net/listingphotos25/OC26165709-7.jpg",
      "https://d36xftgacqn2p.cloudfront.net/listingphotos25/OC26165709-8.jpg",
    ],
    sqft: 2500,
    zillowUrl: "https://www.zillow.com/homes/141-Dolores,-Irvine,-CA-92618_rb/",
    neighborhood: "Great Park",
    propertyType: "House",
  },
];

export {
  mockApplicants,
  mockReports,
  mockApplicationDetails,
  mockExperianPulls,
  mockPayments,
  mockThreads,
};

// Helper functions

/**
 * The sample Irvine catalogue. Real listings live in Neon and are read through
 * lib/listings/service.ts; these are only merged in when LEASEPROOF_DEMO=1, so
 * a new landlord sees a genuinely empty pipeline.
 */
export function demoProperties(): Property[] {
  return mockProperties;
}

/**
 * Demo-catalogue lookup. Used by the marketing surfaces and by the seeded
 * applicant tables, which reference these ids directly.
 */
export function demoPropertyById(id: string): Property | undefined {
  return mockProperties.find((p) => p.id === id);
}

export function getApplicantById(id: string): Applicant | undefined {
  return mockApplicants.find((a) => a.id === id);
}

export function getApplicantsByProperty(propertyId: string): Applicant[] {
  return mockApplicants.filter((a) => a.propertyId === propertyId);
}

export function getReportByApplicant(applicantId: string): ScreeningReport | undefined {
  return mockReports[applicantId];
}

export function getStatusColor(status: ApplicationStatus): string {
  switch (status) {
    case "invited":
      return "text-mute bg-rail border-line";
    case "in_progress":
      return "text-blue bg-blue-soft border-transparent";
    case "completed":
      return "text-ink-2 bg-mist border-line-2";
    case "approved":
      return "text-ok bg-ok-bg border-transparent";
    case "declined":
      return "text-no bg-no-bg border-transparent";
  }
}

export function getStatusLabel(status: ApplicationStatus): string {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function getApplicationDetails(applicantId: string): ApplicationDetails | undefined {
  return mockApplicationDetails[applicantId];
}

// Applications, newest first — the default ordering for the applications table
export function getAllApplications(): Applicant[] {
  return [...mockApplicants].sort(
    (a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime()
  );
}

export function getScoreColor(score: number): string {
  if (score >= 750) return "text-ok";
  if (score >= 650) return "text-ink";
  return "text-no";
}

export function getExperianPull(applicantId: string): ExperianPull | undefined {
  return mockExperianPulls[applicantId];
}

/** Groups an applicant's uploads by document type for the landlord packet. */
export function groupDocuments(
  documents: ApplicationDocument[]
): { type: DocumentType; label: string; documents: ApplicationDocument[] }[] {
  const order: DocumentType[] = [
    "photo_id_front",
    "photo_id_back",
    "paystub",
    "bank_statement",
    "w2",
    "form_1099",
    "portfolio",
    "investment",
    "other",
  ];

  return order
    .map((type) => ({
      type,
      label: documentTypeLabels[type],
      documents: documents.filter((doc) => doc.docType === type),
    }))
    .filter((group) => group.documents.length > 0);
}

export function getScoreLabel(score: number): string {
  if (score >= 750) return "Excellent";
  if (score >= 650) return "Good";
  return "Fair";
}

export function getPaymentsByApplicant(applicantId: string): Payment[] {
  return mockPayments.filter((p) => p.applicantId === applicantId);
}

export function getPaymentStatusColor(status: PaymentStatus): string {
  switch (status) {
    case "paid":
      return "text-ok bg-ok-bg border-transparent";
    case "pending":
      return "text-[#8a6400] bg-warn-bg border-transparent";
    case "refunded":
      return "text-mute bg-rail border-line";
    case "failed":
      return "text-no bg-no-bg border-transparent";
  }
}

export function getThreadsByApplicant(applicantId: string): MessageThread[] {
  return mockThreads.filter((t) => t.applicantId === applicantId);
}

export function getLastMessageAt(thread: MessageThread): string {
  return thread.messages[thread.messages.length - 1]?.sentAt ?? "";
}

export function getScreeningFee(pkg?: ScreeningPackage): number {
  void pkg;
  return STANDARD_SCREENING_FEE;
}

export function screeningPackageLabel(pkg?: ScreeningPackage): string {
  void pkg;
  return STANDARD_PACKAGE_NAME;
}
