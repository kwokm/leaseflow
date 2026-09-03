import type { PublicIncomeCheck } from "@/lib/income/view";
import type { IncomeDocKind } from "@/lib/income/extract";
import type { LocalFile } from "@/lib/apply/types";

export type EnqueueIncomeCheckInput = {
  listingId?: string | null;
  applicationId?: string | null;
  applicantName: string;
  docKind: IncomeDocKind;
  blobPath: string;
  fileName: string;
};

export async function enqueueIncomeCheckRequest(
  input: EnqueueIncomeCheckInput,
): Promise<PublicIncomeCheck | null> {
  try {
    const response = await fetch("/api/income/checks", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!response.ok) return null;
    const payload = (await response.json()) as { check?: PublicIncomeCheck };
    return payload.check ?? null;
  } catch {
    return null;
  }
}

export async function fetchIncomeChecks(query: {
  ids?: string[];
  applicationId?: string;
  listingId?: string;
}): Promise<PublicIncomeCheck[]> {
  const params = new URLSearchParams();
  if (query.ids?.length) params.set("ids", query.ids.join(","));
  if (query.applicationId) params.set("applicationId", query.applicationId);
  if (query.listingId) params.set("listingId", query.listingId);
  if (![...params.keys()].length) return [];

  try {
    const response = await fetch(`/api/income/checks?${params.toString()}`);
    if (!response.ok) return [];
    const payload = (await response.json()) as { checks?: PublicIncomeCheck[] };
    return payload.checks ?? [];
  } catch {
    return [];
  }
}

export function incomeCheckIdsFromFiles(files: (LocalFile | null | undefined)[]): string[] {
  return files
    .map((file) => file?.incomeCheckId)
    .filter((id): id is string => Boolean(id));
}
