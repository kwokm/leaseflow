// Mock data for LeaseFlow prototype

export type ApplicationStatus = "invited" | "in_progress" | "completed" | "approved" | "declined";

export type ScreeningPackage = "standard" | "premium";

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
  documents: { name: string; kind: string; uploadedAt: string }[];
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
export const mockProperties: Property[] = [
  {
    id: "prop-1",
    address: "742 Evergreen Terrace, Springfield, IL 62701",
    rent: 2400,
    bedrooms: 3,
    bathrooms: 2,
    availableDate: "2026-09-01",
    screeningPackage: "premium",
    applyUrl: "https://leaseflow.app/apply/prop-1",
    createdAt: "2026-07-15T10:00:00Z",
  },
  {
    id: "prop-2",
    address: "123 Main Street, Unit 4B, Chicago, IL 60601",
    rent: 1850,
    bedrooms: 2,
    bathrooms: 1,
    availableDate: "2026-08-15",
    screeningPackage: "standard",
    applyUrl: "https://leaseflow.app/apply/prop-2",
    createdAt: "2026-07-20T14:30:00Z",
  },
  {
    id: "prop-3",
    address: "456 Oak Avenue, Austin, TX 78701",
    rent: 3200,
    bedrooms: 4,
    bathrooms: 3,
    availableDate: "2026-10-01",
    screeningPackage: "premium",
    applyUrl: "https://leaseflow.app/apply/prop-3",
    createdAt: "2026-08-01T09:15:00Z",
  },
];

// Sample Applicants
export const mockApplicants: Applicant[] = [
  {
    id: "app-1",
    propertyId: "prop-1",
    status: "completed",
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah.johnson@email.com",
    phone: "(555) 123-4567",
    appliedAt: "2026-07-18T11:00:00Z",
    completedAt: "2026-07-18T11:45:00Z",
    leaseScore: 785,
  },
  {
    id: "app-2",
    propertyId: "prop-1",
    status: "in_progress",
    firstName: "Michael",
    lastName: "Chen",
    email: "m.chen@email.com",
    phone: "(555) 234-5678",
    appliedAt: "2026-07-19T14:20:00Z",
  },
  {
    id: "app-3",
    propertyId: "prop-2",
    status: "approved",
    firstName: "Emily",
    lastName: "Rodriguez",
    email: "emily.r@email.com",
    phone: "(555) 345-6789",
    appliedAt: "2026-07-22T09:30:00Z",
    completedAt: "2026-07-22T10:15:00Z",
    leaseScore: 820,
  },
  {
    id: "app-4",
    propertyId: "prop-2",
    status: "declined",
    firstName: "James",
    lastName: "Wilson",
    email: "james.w@email.com",
    phone: "(555) 456-7890",
    appliedAt: "2026-07-23T16:45:00Z",
    completedAt: "2026-07-23T17:20:00Z",
    leaseScore: 580,
  },
  {
    id: "app-5",
    propertyId: "prop-3",
    status: "invited",
    firstName: "David",
    lastName: "Park",
    email: "david.park@email.com",
    phone: "(555) 567-8901",
    appliedAt: "2026-08-03T10:00:00Z",
  },
  {
    id: "app-6",
    propertyId: "prop-1",
    status: "completed",
    firstName: "Jessica",
    lastName: "Martinez",
    email: "j.martinez@email.com",
    phone: "(555) 678-9012",
    appliedAt: "2026-07-25T13:30:00Z",
    completedAt: "2026-07-25T14:00:00Z",
    leaseScore: 695,
  },
];

// Sample Screening Reports
export const mockReports: Record<string, ScreeningReport> = {
  "app-1": {
    applicantId: "app-1",
    credit: {
      leaseScore: 785,
      paymentHistory: 98,
      creditUtilization: 22,
      totalAccounts: 12,
      derogatoryMarks: 0,
      hardInquiries: 1,
    },
    background: {
      criminal: "clear",
      eviction: "clear",
      sexOffender: "clear",
    },
    income: {
      employer: "Tech Solutions Inc.",
      position: "Senior Software Engineer",
      monthlyIncome: 9500,
      verified: true,
    },
    residentialHistory: [
      {
        address: "890 Pine Street, Springfield, IL 62702",
        from: "2023-06",
        to: "Present",
        landlordVerified: true,
      },
      {
        address: "234 Maple Drive, Bloomington, IL 61701",
        from: "2021-03",
        to: "2023-05",
        landlordVerified: true,
      },
    ],
  },
  "app-3": {
    applicantId: "app-3",
    credit: {
      leaseScore: 820,
      paymentHistory: 100,
      creditUtilization: 15,
      totalAccounts: 8,
      derogatoryMarks: 0,
      hardInquiries: 0,
    },
    background: {
      criminal: "clear",
      eviction: "clear",
      sexOffender: "clear",
    },
    income: {
      employer: "Healthcare Partners",
      position: "Registered Nurse",
      monthlyIncome: 7200,
      verified: true,
    },
    residentialHistory: [
      {
        address: "567 Elm Street, Chicago, IL 60602",
        from: "2022-01",
        to: "Present",
        landlordVerified: true,
      },
    ],
  },
  "app-4": {
    applicantId: "app-4",
    credit: {
      leaseScore: 580,
      paymentHistory: 72,
      creditUtilization: 85,
      totalAccounts: 15,
      derogatoryMarks: 3,
      hardInquiries: 5,
    },
    background: {
      criminal: "records_found",
      eviction: "records_found",
      sexOffender: "clear",
      details: "Misdemeanor (2022), Eviction filed (2023)",
    },
    income: {
      employer: "Retail Solutions",
      position: "Assistant Manager",
      monthlyIncome: 3800,
      verified: true,
    },
    residentialHistory: [
      {
        address: "789 Broadway, Chicago, IL 60603",
        from: "2024-03",
        to: "Present",
        landlordVerified: false,
      },
    ],
  },
  "app-6": {
    applicantId: "app-6",
    credit: {
      leaseScore: 695,
      paymentHistory: 88,
      creditUtilization: 45,
      totalAccounts: 10,
      derogatoryMarks: 1,
      hardInquiries: 2,
    },
    background: {
      criminal: "clear",
      eviction: "clear",
      sexOffender: "clear",
    },
    income: {
      employer: "Marketing Agency Co.",
      position: "Marketing Coordinator",
      monthlyIncome: 5200,
      verified: true,
    },
    residentialHistory: [
      {
        address: "321 River Road, Springfield, IL 62703",
        from: "2023-08",
        to: "Present",
        landlordVerified: true,
      },
    ],
  },
};

// Renter-submitted application details (keyed by applicant id).
// "invited" applicants have not submitted anything yet, so they have no entry.
export const mockApplicationDetails: Record<string, ApplicationDetails> = {
  "app-1": {
    applicantId: "app-1",
    dateOfBirth: "1991-04-12",
    ssnLast4: "4417",
    desiredMoveIn: "2026-09-01",
    currentAddress: {
      address: "890 Pine Street, Springfield, IL 62702",
      since: "2023-06",
      monthlyRent: 1950,
      landlordName: "Pinecrest Property Group",
      landlordPhone: "(555) 881-2200",
      reasonForLeaving: "Needs more space for a home office",
    },
    employment: {
      employer: "Tech Solutions Inc.",
      position: "Senior Software Engineer",
      startDate: "2021-08",
      supervisor: "Dana Whitfield",
      supervisorPhone: "(555) 774-0192",
      monthlyIncome: 9500,
    },
    occupants: [{ name: "Sarah Johnson", relationship: "Applicant", age: 35 }],
    pets: [{ type: "Dog", breed: "Beagle", weight: "24 lbs" }],
    vehicles: [{ year: 2022, make: "Toyota", model: "RAV4", plate: "IL 8KP-2210" }],
    disclosures: { smoker: false, priorEviction: false, bankruptcy: false },
    documents: [
      { name: "paystub-june-2026.pdf", kind: "Pay stub", uploadedAt: "2026-07-18T11:31:00Z" },
      { name: "paystub-july-2026.pdf", kind: "Pay stub", uploadedAt: "2026-07-18T11:32:00Z" },
      { name: "drivers-license.jpg", kind: "Photo ID", uploadedAt: "2026-07-18T11:34:00Z" },
    ],
    consent: {
      acceptedAt: "2026-07-18T11:44:00Z",
      signature: "Sarah Johnson",
      ipAddress: "198.51.100.24",
    },
  },
  "app-2": {
    applicantId: "app-2",
    dateOfBirth: "1994-11-02",
    ssnLast4: "9083",
    desiredMoveIn: "2026-09-15",
    currentAddress: {
      address: "45 Lakeview Court, Springfield, IL 62704",
      since: "2024-02",
      monthlyRent: 1600,
      landlordName: "Ravi Anand",
      landlordPhone: "(555) 220-7781",
      reasonForLeaving: "Lease ending",
    },
    employment: {
      employer: "Northline Logistics",
      position: "Operations Analyst",
      startDate: "2023-05",
      supervisor: "Pending",
      supervisorPhone: "Pending",
      monthlyIncome: 5400,
    },
    occupants: [{ name: "Michael Chen", relationship: "Applicant", age: 31 }],
    pets: [],
    vehicles: [{ year: 2019, make: "Honda", model: "Civic", plate: "IL 4RT-9080" }],
    disclosures: { smoker: false, priorEviction: false, bankruptcy: false },
    documents: [
      { name: "paystub-july-2026.pdf", kind: "Pay stub", uploadedAt: "2026-07-19T14:38:00Z" },
    ],
    consent: {
      acceptedAt: "2026-07-19T14:22:00Z",
      signature: "Michael Chen",
      ipAddress: "203.0.113.77",
    },
  },
  "app-3": {
    applicantId: "app-3",
    dateOfBirth: "1989-07-30",
    ssnLast4: "3355",
    desiredMoveIn: "2026-08-15",
    currentAddress: {
      address: "567 Elm Street, Chicago, IL 60602",
      since: "2022-01",
      monthlyRent: 1725,
      landlordName: "Elmwood Residential LLC",
      landlordPhone: "(555) 640-1188",
      reasonForLeaving: "Relocating closer to hospital",
    },
    employment: {
      employer: "Healthcare Partners",
      position: "Registered Nurse",
      startDate: "2019-03",
      supervisor: "Alicia Moreno",
      supervisorPhone: "(555) 640-3312",
      monthlyIncome: 7200,
    },
    occupants: [
      { name: "Emily Rodriguez", relationship: "Applicant", age: 36 },
      { name: "Luis Rodriguez", relationship: "Spouse", age: 38 },
    ],
    pets: [],
    vehicles: [{ year: 2021, make: "Subaru", model: "Outback", plate: "IL 7HN-4412" }],
    disclosures: { smoker: false, priorEviction: false, bankruptcy: false },
    documents: [
      { name: "offer-letter.pdf", kind: "Employment letter", uploadedAt: "2026-07-22T09:52:00Z" },
      { name: "paystub-june-2026.pdf", kind: "Pay stub", uploadedAt: "2026-07-22T09:54:00Z" },
      { name: "state-id.jpg", kind: "Photo ID", uploadedAt: "2026-07-22T09:55:00Z" },
    ],
    consent: {
      acceptedAt: "2026-07-22T10:12:00Z",
      signature: "Emily Rodriguez",
      ipAddress: "192.0.2.108",
    },
  },
  "app-4": {
    applicantId: "app-4",
    dateOfBirth: "1986-02-17",
    ssnLast4: "1204",
    desiredMoveIn: "2026-08-15",
    currentAddress: {
      address: "789 Broadway, Chicago, IL 60603",
      since: "2024-03",
      monthlyRent: 1400,
      landlordName: "Broadway Flats",
      landlordPhone: "(555) 933-6100",
      reasonForLeaving: "Building being sold",
    },
    employment: {
      employer: "Retail Solutions",
      position: "Assistant Manager",
      startDate: "2024-01",
      supervisor: "Greg Sandoval",
      supervisorPhone: "(555) 933-2280",
      monthlyIncome: 3800,
    },
    occupants: [
      { name: "James Wilson", relationship: "Applicant", age: 40 },
      { name: "Tyler Wilson", relationship: "Child", age: 9 },
    ],
    pets: [{ type: "Cat", breed: "Domestic shorthair", weight: "11 lbs" }],
    vehicles: [],
    disclosures: {
      smoker: true,
      priorEviction: true,
      bankruptcy: false,
      notes: "Eviction filed in 2023 was resolved by payment agreement; case dismissed.",
    },
    documents: [
      { name: "paystub-july-2026.pdf", kind: "Pay stub", uploadedAt: "2026-07-23T17:02:00Z" },
    ],
    consent: {
      acceptedAt: "2026-07-23T17:18:00Z",
      signature: "James Wilson",
      ipAddress: "198.51.100.66",
    },
  },
  "app-6": {
    applicantId: "app-6",
    dateOfBirth: "1996-09-08",
    ssnLast4: "7742",
    desiredMoveIn: "2026-09-01",
    currentAddress: {
      address: "321 River Road, Springfield, IL 62703",
      since: "2023-08",
      monthlyRent: 1500,
      landlordName: "Riverbend Homes",
      landlordPhone: "(555) 415-8890",
      reasonForLeaving: "Wants a longer-term lease",
    },
    employment: {
      employer: "Marketing Agency Co.",
      position: "Marketing Coordinator",
      startDate: "2022-06",
      supervisor: "Nina Patel",
      supervisorPhone: "(555) 415-2031",
      monthlyIncome: 5200,
    },
    occupants: [
      { name: "Jessica Martinez", relationship: "Applicant", age: 29 },
      { name: "Ana Reyes", relationship: "Roommate", age: 30 },
    ],
    pets: [],
    vehicles: [{ year: 2018, make: "Mazda", model: "CX-5", plate: "IL 2LM-7719" }],
    disclosures: { smoker: false, priorEviction: false, bankruptcy: false },
    documents: [
      { name: "paystub-july-2026.pdf", kind: "Pay stub", uploadedAt: "2026-07-25T13:41:00Z" },
      { name: "bank-statement.pdf", kind: "Bank statement", uploadedAt: "2026-07-25T13:44:00Z" },
    ],
    consent: {
      acceptedAt: "2026-07-25T13:58:00Z",
      signature: "Jessica Martinez",
      ipAddress: "203.0.113.12",
    },
  },
};

// Payments ledger (screening fees collected from renters, deposits, payouts)
export const mockPayments: Payment[] = [
  {
    id: "pay-1",
    kind: "screening_fee",
    description: "Premium screening fee",
    applicantId: "app-1",
    propertyId: "prop-1",
    amount: 59.99,
    status: "paid",
    method: "Visa ···4242",
    createdAt: "2026-07-18T11:45:00Z",
  },
  {
    id: "pay-2",
    kind: "screening_fee",
    description: "Standard screening fee",
    applicantId: "app-3",
    propertyId: "prop-2",
    amount: 39.99,
    status: "paid",
    method: "Mastercard ···5518",
    createdAt: "2026-07-22T10:15:00Z",
  },
  {
    id: "pay-3",
    kind: "screening_fee",
    description: "Standard screening fee",
    applicantId: "app-4",
    propertyId: "prop-2",
    amount: 39.99,
    status: "refunded",
    method: "Visa ···9931",
    createdAt: "2026-07-23T17:20:00Z",
  },
  {
    id: "pay-4",
    kind: "screening_fee",
    description: "Premium screening fee",
    applicantId: "app-6",
    propertyId: "prop-1",
    amount: 59.99,
    status: "paid",
    method: "Amex ···1007",
    createdAt: "2026-07-25T14:00:00Z",
  },
  {
    id: "pay-5",
    kind: "screening_fee",
    description: "Premium screening fee",
    applicantId: "app-2",
    propertyId: "prop-1",
    amount: 59.99,
    status: "pending",
    method: "Awaiting payment",
    createdAt: "2026-07-19T14:20:00Z",
  },
  {
    id: "pay-6",
    kind: "holding_deposit",
    description: "Holding deposit — 123 Main Street, Unit 4B",
    applicantId: "app-3",
    propertyId: "prop-2",
    amount: 500,
    status: "paid",
    method: "ACH ···8820",
    createdAt: "2026-07-23T12:05:00Z",
  },
  {
    id: "pay-7",
    kind: "payout",
    description: "Payout to bank account ···6642",
    amount: 619.96,
    status: "pending",
    method: "ACH transfer",
    createdAt: "2026-08-01T08:00:00Z",
  },
];

// Message threads between the landlord and applicants
export const mockThreads: MessageThread[] = [
  {
    id: "thread-1",
    applicantId: "app-1",
    propertyId: "prop-1",
    subject: "Move-in timing",
    unread: 2,
    messages: [
      {
        id: "msg-1",
        from: "applicant",
        body: "Hi! I just submitted my application for 742 Evergreen Terrace. Is the September 1 move-in date still available?",
        sentAt: "2026-07-18T12:02:00Z",
      },
      {
        id: "msg-2",
        from: "landlord",
        body: "It is. Your screening report came back this morning and everything looks good so far.",
        sentAt: "2026-07-18T15:20:00Z",
      },
      {
        id: "msg-3",
        from: "applicant",
        body: "That's great news. Would it be possible to schedule a walkthrough next week?",
        sentAt: "2026-07-19T09:10:00Z",
      },
    ],
  },
  {
    id: "thread-2",
    applicantId: "app-2",
    propertyId: "prop-1",
    subject: "Missing pay stub",
    unread: 1,
    messages: [
      {
        id: "msg-4",
        from: "landlord",
        body: "Hi Michael — your application is still missing a second pay stub and your supervisor's contact info.",
        sentAt: "2026-07-20T10:00:00Z",
      },
      {
        id: "msg-5",
        from: "applicant",
        body: "Thanks for the reminder, I'll upload both by Friday.",
        sentAt: "2026-07-20T18:45:00Z",
      },
    ],
  },
  {
    id: "thread-3",
    applicantId: "app-3",
    propertyId: "prop-2",
    subject: "Lease signing",
    unread: 0,
    messages: [
      {
        id: "msg-6",
        from: "landlord",
        body: "Congratulations, your application was approved! I'll send the lease over for signature.",
        sentAt: "2026-07-22T16:30:00Z",
      },
      {
        id: "msg-7",
        from: "applicant",
        body: "Wonderful — thank you. I've sent the holding deposit through the payment link.",
        sentAt: "2026-07-23T12:06:00Z",
      },
    ],
  },
];

// Helper functions
export function getPropertyById(id: string): Property | undefined {
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
      return "text-gray-600 bg-gray-100";
    case "in_progress":
      return "text-blue-600 bg-blue-100";
    case "completed":
      return "text-purple-600 bg-purple-100";
    case "approved":
      return "text-green-600 bg-green-100";
    case "declined":
      return "text-red-600 bg-red-100";
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
  if (score >= 750) return "text-green-600";
  if (score >= 650) return "text-yellow-600";
  return "text-red-600";
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
      return "text-green-700 bg-green-100";
    case "pending":
      return "text-orange-700 bg-orange-100";
    case "refunded":
      return "text-gray-700 bg-gray-100";
    case "failed":
      return "text-red-700 bg-red-100";
  }
}

export function getThreadsByApplicant(applicantId: string): MessageThread[] {
  return mockThreads.filter((t) => t.applicantId === applicantId);
}

export function getLastMessageAt(thread: MessageThread): string {
  return thread.messages[thread.messages.length - 1]?.sentAt ?? "";
}

export function getScreeningFee(pkg: ScreeningPackage): number {
  return pkg === "premium" ? 59.99 : 39.99;
}
