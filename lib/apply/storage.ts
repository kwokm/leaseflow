import { APPLY_STATE_VERSION, createDemoState, type ApplyState, type LocalFile } from "./types";
import type { ScreeningPackage } from "@/lib/data/mock-data";

const DRAFT_PREFIX = "leaseflow:apply:";
const SUBMISSION_KEY = "leaseflow:submissions";

function draftKey(listingId: string) {
  return `${DRAFT_PREFIX}${listingId}`;
}

/**
 * Object URLs are per-session; they cannot survive a reload. We keep the file
 * metadata so the renter still sees what they attached, and mark the preview as
 * unavailable rather than rendering a dead URL.
 */
function stripUrls(files: (LocalFile | null)[]): void {
  for (const file of files) {
    if (file) delete file.url;
  }
}

export function loadDraft(listingId: string, pkg: ScreeningPackage): ApplyState {
  const fresh = createDemoState(listingId, pkg);
  if (typeof window === "undefined") return fresh;

  try {
    const raw = window.localStorage.getItem(draftKey(listingId));
    if (!raw) return fresh;

    const parsed = JSON.parse(raw) as ApplyState;
    if (parsed.version !== APPLY_STATE_VERSION) return fresh;

    const merged: ApplyState = {
      ...fresh,
      ...parsed,
      personal: { ...fresh.personal, ...parsed.personal },
      income: { ...fresh.income, ...parsed.income },
      bank: { ...fresh.bank, ...parsed.bank },
      experian: { ...fresh.experian, ...parsed.experian },
      household: { ...fresh.household, ...parsed.household },
      consent: { ...fresh.consent, ...parsed.consent },
      // Card details are not persisted; refill the demo card so Review stays clickable.
      payment: parsed.payment?.cardNumber
        ? { ...fresh.payment, ...parsed.payment }
        : fresh.payment,
      paystubs: parsed.paystubs ?? fresh.paystubs,
      statements: parsed.statements ?? fresh.statements,
      idFront: parsed.idFront ?? fresh.idFront,
      idBack: parsed.idBack ?? fresh.idBack,
    };

    stripUrls([merged.idFront, merged.idBack, ...merged.paystubs, ...merged.statements]);
    return merged;
  } catch {
    return fresh;
  }
}

export function saveDraft(state: ApplyState): void {
  if (typeof window === "undefined") return;
  try {
    // Card details are deliberately never persisted, even in the prototype.
    const { payment: _payment, ...persisted } = state;
    window.localStorage.setItem(draftKey(state.listingId), JSON.stringify(persisted));
  } catch {
    // Storage can be full or blocked (private mode) — the wizard still works.
  }
}

export function clearDraft(listingId: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(draftKey(listingId));
  } catch {
    // ignore
  }
}

/**
 * Applications submitted from this browser. The dashboard reads these so a
 * freshly submitted application shows up alongside the seeded mock ones.
 */
export function loadSubmissions(): ApplyState[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(SUBMISSION_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ApplyState[];
    return Array.isArray(parsed)
      ? parsed.filter((entry) => entry && entry.version === APPLY_STATE_VERSION)
      : [];
  } catch {
    return [];
  }
}

export function saveSubmission(state: ApplyState): void {
  if (typeof window === "undefined") return;
  try {
    const { payment: _payment, ...persisted } = state;
    const existing = loadSubmissions().filter(
      (entry) => entry.confirmationId !== state.confirmationId
    );
    const next = [persisted as ApplyState, ...existing].slice(0, 10);
    window.localStorage.setItem(SUBMISSION_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}

export function getSubmission(confirmationId: string): ApplyState | undefined {
  return loadSubmissions().find((entry) => entry.confirmationId === confirmationId);
}
