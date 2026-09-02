import "server-only";

import Stripe from "stripe";
import { stripeEnabled } from "@/lib/config/env";

let cached: Stripe | undefined;

/** Null when STRIPE_SECRET_KEY is absent, so callers can degrade rather than throw. */
export function getStripe(): Stripe | null {
  if (!stripeEnabled()) return null;
  if (!cached) {
    // No apiVersion override: the SDK pins one, so the version moves only when
    // the dependency is deliberately upgraded.
    cached = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
      appInfo: { name: "Leaseproof", url: "https://leaseproof.app" },
    });
  }
  return cached;
}

/**
 * Test-mode keys start `sk_test_`. Surfaced so the UI can label the checkout as
 * a test charge, and so a live key in a preview environment is noticeable.
 */
export function stripeIsTestMode(): boolean {
  return (process.env.STRIPE_SECRET_KEY ?? "").startsWith("sk_test_");
}

export function stripeWebhookSecret(): string | null {
  return process.env.STRIPE_WEBHOOK_SECRET ?? null;
}
