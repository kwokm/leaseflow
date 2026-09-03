import {
  getApplicationDetails,
  getExperianPull,
  getReportByApplicant,
  type Applicant,
} from "@/lib/data/mock-data";

export const SCREENING_TASKS = [
  { key: "photoId", label: "Photo ID" },
  { key: "experian", label: "Experian" },
  { key: "income", label: "AI Income Check" },
  { key: "background", label: "Background" },
] as const;

export type ScreeningKey = (typeof SCREENING_TASKS)[number]["key"];

export function screeningChecks(applicant: Applicant): Record<ScreeningKey, boolean> {
  const report = getReportByApplicant(applicant.id);
  const docs = getApplicationDetails(applicant.id)?.documents ?? [];
  const kinds = new Set(docs.map((doc) => doc.docType));

  return {
    photoId: kinds.has("photo_id_front") || kinds.has("photo_id_back"),
    experian: Boolean(getExperianPull(applicant.id) || report?.credit),
    income: applicant.incomeCheck
      ? applicant.incomeCheck.status === "ready"
      : Boolean(
          report?.income.verified ||
            kinds.has("paystub") ||
            kinds.has("bank_statement") ||
            kinds.has("w2"),
        ),
    background: Boolean(report?.background),
  };
}
