import {
  demoPropertyById,
  getReportByApplicant,
  type Applicant,
  type ApplicationStatus,
} from "@/lib/data/mock-data";
import {
  getAiIncome,
  getHousehold,
  groupApplicantsByHousehold,
  type AiIncomeScreen,
  type HouseholdGroup,
} from "@/lib/data/household-model";

export type { HouseholdGroup };

function leadStatus(statuses: ApplicationStatus[]): ApplicationStatus | undefined {
  if (statuses.includes("approved")) return "approved";
  if (statuses.includes("completed")) return "completed";
  if (statuses.includes("declined")) return "declined";
  if (statuses.includes("in_progress")) return "in_progress";
  if (statuses.includes("invited")) return "invited";
  return undefined;
}


export function fullName(applicant: Applicant): string {
  return `${applicant.firstName} ${applicant.lastName}`.trim();
}

export function grossMonthlyOf(applicant: Applicant): number | undefined {
  if (applicant.incomeCheck?.monthlyGross != null) {
    return applicant.incomeCheck.monthlyGross;
  }
  const screen = getAiIncome(applicant.id);
  if (screen?.grossMonthly) return screen.grossMonthly;
  const report = getReportByApplicant(applicant.id);
  return report?.income.monthlyIncome;
}

export function aiIncomeSourceLabel(screen: AiIncomeScreen): string {
  const pay = screen.documents.filter((doc) => doc.kind === "paystub").length;
  const w2 = screen.documents.filter((doc) => doc.kind === "w2").length;
  const parts: string[] = [];
  if (pay) parts.push(`${pay} paystub${pay === 1 ? "" : "s"}`);
  if (w2) parts.push("W-2");
  if (parts.length) return `From ${parts.join(" + ")}`;
  if (screen.source === "paystub+w2") return "From paystubs + W-2";
  if (screen.source === "w2") return "From W-2";
  return "From paystubs";
}

export function formatAiIncomeLine(screen: AiIncomeScreen): string {
  return `AI Income Check · $${screen.grossMonthly.toLocaleString()} / mo gross`;
}

export function formatGrossMonthly(amount: number): string {
  return `$${amount.toLocaleString()} / mo`;
}

export function householdsFirst(applicants: Applicant[]): HouseholdGroup[] {
  const grouped = groupApplicantsByHousehold(applicants);
  return [
    ...grouped.filter((group) => group.kind === "household"),
    ...grouped.filter((group) => group.kind === "solo"),
  ];
}

export function householdMembers(
  applicant: Applicant,
  pool: Applicant[] = [],
): Applicant[] {
  if (!applicant.householdId) return [applicant];
  const members = getHousehold(applicant.householdId, pool.length ? pool : undefined).filter(
    (row) => row.propertyId === applicant.propertyId,
  );
  return members.length ? members : [applicant];
}

export function coTenantsOf(applicant: Applicant, pool: Applicant[] = []): Applicant[] {
  return householdMembers(applicant, pool).filter((row) => row.id !== applicant.id);
}

export interface HouseholdTotals {
  members: Applicant[];
  names: string;
  combinedGrossMonthly: number;
  rent?: number;
  multiple?: number;
  vsRent?: string;
  householdScore?: number;
  memberScores: { id: string; name: string; score?: number; grossMonthly?: number }[];
  leadStatus: ReturnType<typeof leadStatus>;
}

export function householdTotals(members: Applicant[], rent?: number): HouseholdTotals {
  const propertyRent = rent ?? demoPropertyById(members[0]?.propertyId ?? "")?.rent;
  const memberScores = members.map((row) => ({
    id: row.id,
    name: fullName(row),
    score: row.leaseScore,
    grossMonthly: grossMonthlyOf(row),
  }));

  const combinedGrossMonthly = memberScores.reduce(
    (sum, row) => sum + (row.grossMonthly ?? 0),
    0,
  );

  let weighted = 0;
  let weight = 0;
  for (const row of memberScores) {
    if (typeof row.score !== "number") continue;
    const w = row.grossMonthly && row.grossMonthly > 0 ? row.grossMonthly : 1;
    weighted += row.score * w;
    weight += w;
  }

  const multiple =
    combinedGrossMonthly && propertyRent
      ? combinedGrossMonthly / propertyRent
      : undefined;

  return {
    members,
    names: members.map(fullName).join(" + "),
    combinedGrossMonthly,
    rent: propertyRent,
    multiple,
    vsRent:
      combinedGrossMonthly && propertyRent
        ? `$${combinedGrossMonthly.toLocaleString()} / mo · ${multiple!.toFixed(1)}× $${propertyRent.toLocaleString()} rent`
        : undefined,
    householdScore: weight ? Math.round(weighted / weight) : undefined,
    memberScores,
    leadStatus: leadStatus(members.map((row) => row.status)),
  };
}

export function matchHouseholdId(input: {
  listingId: string;
  selfName: string;
  occupantNames: string[];
  pool?: Applicant[];
}): string | undefined {
  const { listingId, selfName, occupantNames, pool = [] } = input;
  const normalize = (value: string) => value.trim().toLowerCase().replace(/\s+/g, " ");
  const self = normalize(selfName);
  const wanted = new Set(
    occupantNames.map(normalize).filter((name) => name && name !== self),
  );
  if (!wanted.size) return undefined;

  const onListing = pool.filter((row) => row.propertyId === listingId);
  const hit = onListing.find((row) => wanted.has(normalize(fullName(row))));
  if (!hit) return undefined;
  return hit.householdId ?? `hh-${listingId}-${slugName(selfName)}-${slugName(fullName(hit))}`;
}

function slugName(name: string): string {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "applicant";
}
