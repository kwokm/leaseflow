"use client";

import type { ApplyState } from "@/lib/apply/types";

export type SubmitOutcome =
  | { kind: "checkout"; url: string; applicationId: string; confirmationId: string }
  | { kind: "paid"; applicationId: string; confirmationId: string }
  | { kind: "error"; message: string };

/**
 * Sends the packet to the server, which stores it and (when Stripe is
 * configured) returns a Checkout URL. The applicant is charged before any
 * credit report is requested, so this never completes the application itself —
 * the Stripe webhook does.
 */
export async function submitApplication(state: ApplyState): Promise<SubmitOutcome> {
  let response: Response;
  try {
    response = await fetch("/api/applications", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ state }),
    });
  } catch {
    return { kind: "error", message: "Could not reach Leaseproof. Check your connection." };
  }

  const payload = (await response.json().catch(() => ({}))) as {
    application?: { id: string; confirmationId: string };
    checkoutUrl?: string | null;
    demoSkippedPayment?: boolean;
    error?: string;
  };

  if (!response.ok || !payload.application) {
    return { kind: "error", message: payload.error ?? "Could not submit that application." };
  }

  if (payload.checkoutUrl) {
    return {
      kind: "checkout",
      url: payload.checkoutUrl,
      applicationId: payload.application.id,
      confirmationId: payload.application.confirmationId,
    };
  }

  return {
    kind: "paid",
    applicationId: payload.application.id,
    confirmationId: payload.application.confirmationId,
  };
}

/** Polled after returning from Checkout — the webhook may land a moment later. */
export async function fetchApplicationStatus(
  applicationId: string
): Promise<{ paid: boolean; confirmationId: string } | null> {
  try {
    const response = await fetch(`/api/applications/${encodeURIComponent(applicationId)}`);
    if (!response.ok) return null;
    const payload = (await response.json()) as {
      application?: { paid: boolean; confirmationId: string };
    };
    return payload.application ?? null;
  } catch {
    return null;
  }
}
