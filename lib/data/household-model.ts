import {
  mockApplicants,
  mockApplicationDetails,
  mockExperianPulls,
  mockReports,
  type Applicant,
  type ExperianPull,
  type ScreeningReport,
} from "@/lib/data/mock-data";

/** Featured listing is 170 Chorus; id stays resh-510 so apply/pipeline wiring does not break. */
export const DEMO_HOUSEHOLD_ID = "hh-resh-510-sarah-jessica";

export type AiIncomeSource = "paystub" | "w2" | "paystub+w2";

export interface AiIncomeDocument {
  name: string;
  kind: "paystub" | "w2";
  extractedMonthly: number;
  note: string;
}

/** Mock AI read of paystubs / W-2s — no live OCR or bureau. */
export interface AiIncomeScreen {
  grossMonthly: number;
  source: AiIncomeSource;
  documents: AiIncomeDocument[];
  verified: boolean;
}

export type HouseholdGroup =
  | { kind: "solo"; applicant: Applicant }
  | { kind: "household"; householdId: string; propertyId: string; members: Applicant[] };

declare module "@/lib/data/mock-data" {
  interface Applicant {
    /** Shared only when people are applying together — not everyone on a listing. */
    householdId?: string;
  }
  interface ScreeningReport {
    aiIncome?: AiIncomeScreen;
  }
}

function paystubs(files: { name: string; monthly: number; note: string }[]): AiIncomeDocument[] {
  return files.map((file) => ({
    name: file.name,
    kind: "paystub",
    extractedMonthly: file.monthly,
    note: file.note,
  }));
}

let patched = false;

/** Seed the demo household + AI monthly gross onto the in-memory mock tables. */
export function ensureHouseholdDemo(): void {
  if (patched) return;
  patched = true;

  const sarah = mockApplicants.find((row) => row.id === "app-1");
  const jessica = mockApplicants.find((row) => row.id === "app-6");
  const jane = mockApplicants.find((row) => row.id === "app-jane");
  if (sarah) sarah.householdId = DEMO_HOUSEHOLD_ID;
  if (jessica) jessica.householdId = DEMO_HOUSEHOLD_ID;
  if (jane && jane.leaseScore == null) jane.leaseScore = 720;

  const screens: Record<string, AiIncomeScreen> = {
    "app-1": {
      grossMonthly: 9500,
      source: "paystub",
      verified: true,
      documents: paystubs([
        { name: "paystub-june-2026.pdf", monthly: 9500, note: "Semi-monthly gross $4,750 × 2" },
        { name: "paystub-july-2026.pdf", monthly: 9500, note: "Semi-monthly gross $4,750 × 2" },
      ]),
    },
    "app-6": {
      grossMonthly: 5200,
      source: "paystub",
      verified: true,
      documents: paystubs([
        { name: "paystub-june-2026.pdf", monthly: 5200, note: "Biweekly gross $2,400 × 26 / 12" },
        { name: "paystub-july-2026.pdf", monthly: 5200, note: "Biweekly gross $2,400 × 26 / 12" },
      ]),
    },
    "app-3": {
      grossMonthly: 7200,
      source: "paystub",
      verified: true,
      documents: paystubs([
        { name: "paystub-june-2026.pdf", monthly: 7200, note: "Biweekly gross $3,323 × 26 / 12" },
        { name: "paystub-july-2026.pdf", monthly: 7200, note: "Biweekly gross $3,323 × 26 / 12" },
      ]),
    },
    "app-4": {
      grossMonthly: 3800,
      source: "paystub",
      verified: true,
      documents: paystubs([
        { name: "paystub-july-2026.pdf", monthly: 3800, note: "Monthly gross $3,800 × 1" },
      ]),
    },
  };

  for (const [id, screen] of Object.entries(screens)) {
    const report = mockReports[id] as ScreeningReport | undefined;
    if (report) report.aiIncome = screen;
  }

  if (!mockReports["app-jane"]) {
    mockReports["app-jane"] = {
      applicantId: "app-jane",
      credit: {
        leaseScore: 720,
        paymentHistory: 99,
        creditUtilization: 32,
        totalAccounts: 8,
        derogatoryMarks: 0,
        hardInquiries: 1,
      },
      background: {
        criminal: "clear",
        eviction: "clear",
        sexOffender: "clear",
        details: "Mock public-records scan — demo data only, no records were searched.",
      },
      income: {
        employer: "Leaseproof Demo Co",
        position: "Product designer",
        monthlyIncome: 8500,
        verified: true,
      },
      residentialHistory: [
        {
          address: "88 Pine Court 2A, San Francisco, CA 94102",
          from: "2022-03",
          to: "Present",
          landlordVerified: true,
        },
      ],
    };
  }
  (mockReports["app-jane"] as ScreeningReport).aiIncome = {
    grossMonthly: 8500,
    source: "paystub+w2",
    verified: true,
    documents: [
      {
        name: "paystub-june-2026.pdf",
        kind: "paystub",
        extractedMonthly: 8500,
        note: "Semi-monthly gross $4,250 × 2",
      },
      {
        name: "paystub-july-2026.pdf",
        kind: "paystub",
        extractedMonthly: 8500,
        note: "Semi-monthly gross $4,250 × 2",
      },
      {
        name: "w2-2025.pdf",
        kind: "w2",
        extractedMonthly: 8500,
        note: "Box 1 wages $102,000 / 12 — reconciled with paystubs",
      },
    ],
  };

  const sarahDetails = mockApplicationDetails["app-1"];
  if (sarahDetails) {
    sarahDetails.occupants = [
      { name: "Sarah Johnson", relationship: "Applicant", age: 35 },
      { name: "Jessica Martinez", relationship: "Co-tenant", age: 29 },
    ];
  }
  const jessicaDetails = mockApplicationDetails["app-6"];
  if (jessicaDetails) {
    jessicaDetails.occupants = [
      { name: "Jessica Martinez", relationship: "Applicant", age: 29 },
      { name: "Sarah Johnson", relationship: "Co-tenant", age: 35 },
    ];
  }

  if (!mockExperianPulls["app-jane"]) {
    const janePull: ExperianPull = {
      applicantId: "app-jane",
      provider: "Experian (demo)",
      status: "connected",
      score: 720,
      scoreModel: "VantageScore 3.0 (demo)",
      pulledAt: "2026-08-01T12:10:00Z",
      fileMatched: true,
      onTimePaymentRate: 99,
      openAccounts: 8,
      oldestAccountYears: 7,
      recentInquiries: 1,
      publicRecords: 0,
      factors: [
        "No missed payments reported in the last 24 months",
        "Revolving utilization in the low 30% range",
      ],
    };
    mockExperianPulls["app-jane"] = janePull;
  }
}

ensureHouseholdDemo();

export function getAiIncome(applicantId: string): AiIncomeScreen | undefined {
  ensureHouseholdDemo();
  return mockReports[applicantId]?.aiIncome;
}

export function getHousehold(id: string, applicants: Applicant[] = mockApplicants): Applicant[] {
  ensureHouseholdDemo();
  return applicants.filter((applicant) => applicant.householdId === id);
}

/**
 * Roommate groups share householdId + propertyId. Competing applications on the
 * same home stay solo unless they opted into the same household.
 */
export function groupApplicantsByHousehold(applicants: Applicant[]): HouseholdGroup[] {
  ensureHouseholdDemo();
  const groups: HouseholdGroup[] = [];
  const seen = new Set<string>();

  for (const applicant of applicants) {
    if (seen.has(applicant.id)) continue;
    const householdId = applicant.householdId;
    if (!householdId) {
      seen.add(applicant.id);
      groups.push({ kind: "solo", applicant });
      continue;
    }

    const members = applicants.filter(
      (row) => row.householdId === householdId && row.propertyId === applicant.propertyId,
    );
    if (members.length < 2) {
      seen.add(applicant.id);
      groups.push({ kind: "solo", applicant });
      continue;
    }

    for (const member of members) seen.add(member.id);
    groups.push({
      kind: "household",
      householdId,
      propertyId: applicant.propertyId,
      members,
    });
  }

  return groups;
}
