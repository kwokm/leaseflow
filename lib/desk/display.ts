import {
  getExperianPull,
  demoPropertyById,
  getReportByApplicant,
  mockApplicants,
  type Applicant,
  type ApplicationStatus,
} from "@/lib/data/mock-data";
import { getAiIncome } from "@/lib/data/household-model";

export const DESK_HERO_IDS = ["app-1", "app-6", "app-4"] as const;

const AVA_BY_INITIALS: Record<string, string> = {
  SJ: "ava-sj",
  ER: "ava-er",
  JW: "ava-jw",
  AP: "ava-ap",
  JD: "ava-jd",
  MC: "ava-dk",
  DP: "ava-dk",
  JM: "ava-ap",
};

export function initialsOf(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function avatarClass(firstName: string, lastName: string): string {
  const initials = initialsOf(firstName, lastName);
  return AVA_BY_INITIALS[initials] ?? "ava-dk";
}

/** Street (+ unit) only - matches 170 Chorus / 14 Modesto. */
export function shortAddress(address: string): string {
  const parts = address.split(",").map((part) => part.trim());
  const street = parts[0] ?? address;
  const maybeUnit = parts[1];
  if (
    maybeUnit &&
    /^(unit|apt|suite|#)/i.test(maybeUnit)
  ) {
    return `${street} ${maybeUnit.replace(/^(unit|apt|suite)\s+/i, "")}`;
  }
  return street;
}

export function statusLabel(status: ApplicationStatus): string {
  switch (status) {
    case "approved":
      return "Approved";
    case "declined":
      return "Declined";
    case "completed":
      return "In review";
    case "in_progress":
      return "Incomplete";
    case "invited":
      return "Incomplete";
  }
}

export function statusClass(status: ApplicationStatus): string {
  if (status === "approved") return "status status-ok";
  if (status === "declined") return "status status-no";
  return "status";
}

export function incomeMultiple(applicant: Applicant): number | undefined {
  const screen = getAiIncome(applicant.id);
  const report = getReportByApplicant(applicant.id);
  const property = demoPropertyById(applicant.propertyId);
  const monthly = screen?.grossMonthly ?? report?.income.monthlyIncome;
  if (!monthly || !property?.rent) return undefined;
  return monthly / property.rent;
}

export function creditScore(applicant: Applicant): number | undefined {
  return getExperianPull(applicant.id)?.score ?? getReportByApplicant(applicant.id)?.credit.leaseScore;
}

export function deskHeroApplicants(): Applicant[] {
  return DESK_HERO_IDS.map((id) => mockApplicants.find((row) => row.id === id)).filter(
    (row): row is Applicant => Boolean(row)
  );
}

export function sortDeskFirst(applicants: Applicant[]): Applicant[] {
  const rank = new Map<string, number>(DESK_HERO_IDS.map((id, index) => [id, index]));
  return [...applicants].sort((a, b) => {
    const aRank = rank.get(a.id);
    const bRank = rank.get(b.id);
    if (aRank !== undefined || bRank !== undefined) {
      return (aRank ?? 100) - (bRank ?? 100);
    }
    return new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime();
  });
}
