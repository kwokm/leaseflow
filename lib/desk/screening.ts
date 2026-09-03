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

const PHOTO_ID_KINDS = new Set(["photo_id_front", "photo_id_back"]);

function hasPhotoId(kinds: Iterable<string>): boolean {
  for (const kind of kinds) {
    if (PHOTO_ID_KINDS.has(kind)) return true;
  }
  return false;
}

/**
 * Live desk ticks. Only Neon fields — never Jane Doe mock rows. Background
 * stays off until there is a vendor.
 */
export function deskScreeningChecks(applicant: Applicant): Record<ScreeningKey, boolean> {
  const kinds = applicant.screening?.documentKinds ?? [];
  return {
    photoId: hasPhotoId(kinds),
    experian: applicant.screening?.creditShareStatus === "shared",
    income: applicant.incomeCheck?.status === "ready",
    background: false,
  };
}

function previewScreeningChecks(applicant: Applicant): Record<ScreeningKey, boolean> {
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

export function screeningChecks(applicant: Applicant): Record<ScreeningKey, boolean> {
  // Desk applicants always carry a `screening` object from listDeskApplicants,
  // even when every tick is empty. Preview / Jane Doe packets do not.
  if (applicant.screening) {
    return deskScreeningChecks(applicant);
  }
  return previewScreeningChecks(applicant);
}
