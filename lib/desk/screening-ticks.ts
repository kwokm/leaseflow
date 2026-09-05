export const SCREENING_TASKS = [
  { key: "photoId", label: "Photo ID" },
  { key: "experian", label: "Experian" },
  { key: "income", label: "AI Income Check" },
  { key: "background", label: "Background" },
] as const;

export type ScreeningKey = (typeof SCREENING_TASKS)[number]["key"];

export type DeskTickApplicant = {
  screening?: {
    documentKinds: string[];
    creditShareStatus: string | null;
  };
  incomeCheck?: { status: string } | null;
};

const PHOTO_ID_KINDS = new Set(["photo_id_front", "photo_id_back"]);

export function hasPhotoId(kinds: Iterable<string>): boolean {
  for (const kind of kinds) {
    if (PHOTO_ID_KINDS.has(kind)) return true;
  }
  return false;
}

/**
 * Live desk ticks. Only Neon fields — never Jane Doe mock rows. Background
 * stays off until there is a vendor.
 */
export function deskScreeningChecks(applicant: DeskTickApplicant): Record<ScreeningKey, boolean> {
  const kinds = applicant.screening?.documentKinds ?? [];
  return {
    photoId: hasPhotoId(kinds),
    experian: applicant.screening?.creditShareStatus === "shared",
    income: applicant.incomeCheck?.status === "ready",
    background: false,
  };
}
