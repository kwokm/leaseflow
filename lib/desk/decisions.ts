import type { ApplicationStatus } from "@/lib/data/mock-data";

const KEY = "leaseflow:decisions";

export type DecisionStatus = "approved" | "declined";

export function loadDecisions(): Record<string, DecisionStatus> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, DecisionStatus>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function setDecision(applicantId: string, status: DecisionStatus): void {
  if (typeof window === "undefined") return;
  const next = { ...loadDecisions(), [applicantId]: status };
  window.localStorage.setItem(KEY, JSON.stringify(next));
}

export function withDecision<T extends { id: string; status: ApplicationStatus }>(
  row: T,
  decisions: Record<string, DecisionStatus> = loadDecisions()
): T {
  const status = decisions[row.id];
  return status ? { ...row, status } : row;
}
