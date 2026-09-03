import {
  getApplicationDetails,
  getExperianPull,
  getReportByApplicant,
  type Applicant,
} from "@/lib/data/mock-data";
import { deskScreeningChecks, hasPhotoId, SCREENING_TASKS } from "@/lib/desk/screening-ticks";

export { deskScreeningChecks, SCREENING_TASKS };
export type { ScreeningKey } from "@/lib/desk/screening-ticks";

function previewScreeningChecks(applicant: Applicant): Record<
  (typeof SCREENING_TASKS)[number]["key"],
  boolean
> {
  const report = getReportByApplicant(applicant.id);
  const docs = getApplicationDetails(applicant.id)?.documents ?? [];
  const kinds = new Set(docs.map((doc) => doc.docType));

  return {
    photoId: hasPhotoId(kinds),
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

export function screeningChecks(applicant: Applicant): Record<
  (typeof SCREENING_TASKS)[number]["key"],
  boolean
> {
  // Desk applicants always carry a `screening` object from listDeskApplicants,
  // even when every tick is empty. Preview / Jane Doe packets do not.
  if (applicant.screening) {
    return deskScreeningChecks(applicant);
  }
  return previewScreeningChecks(applicant);
}
