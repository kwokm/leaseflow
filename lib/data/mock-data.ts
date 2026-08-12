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
