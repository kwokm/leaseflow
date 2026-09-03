import type { AdverseActionType } from "@/lib/legal/fcra";

const KEY = "leaseflow:adverse-action-notices";

export type StoredAdverseActionNotice = {
  noticeId: string;
  applicationId: string;
  listingId: string;
  landlordId: string | null;
  applicantUserId: string | null;
  actionTypes: AdverseActionType[];
  otherAction: string | null;
  letterText: string;
  letterSubject: string;
  copyVersion: string;
  sentAt: string;
  deliveryChannel: "email" | "packet";
  emailStatus: "sent" | "queued";
  emailQueuedReason?: string;
  scoreBlockIncluded: boolean;
  enclosureHref: string;
  persisted: boolean;
};

export function loadAdverseActionNotices(): StoredAdverseActionNotice[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredAdverseActionNotice[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function noticesForApplication(applicationId: string): StoredAdverseActionNotice[] {
  return loadAdverseActionNotices()
    .filter((row) => row.applicationId === applicationId)
    .sort((a, b) => (a.sentAt < b.sentAt ? 1 : -1));
}

export function saveAdverseActionNotice(notice: StoredAdverseActionNotice): void {
  if (typeof window === "undefined") return;
  try {
    const existing = loadAdverseActionNotices().filter((row) => row.noticeId !== notice.noticeId);
    window.localStorage.setItem(KEY, JSON.stringify([notice, ...existing].slice(0, 50)));
  } catch {
    // Storage can be full or blocked — the server archive is the record of truth.
  }
}
