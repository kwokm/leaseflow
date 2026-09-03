import "server-only";

import { attachCheckoutSession } from "@/lib/applications/service";
import { liveChargesAllowed } from "@/lib/config/env";
import { LIVE_CHARGES_BLOCKED_MESSAGE } from "@/lib/payments/live-fees";
import { getStripe } from "@/lib/payments/stripe";
import {
  STANDARD_SCREENING_DESCRIPTION,
  STANDARD_SCREENING_FEE_CENTS,
  STANDARD_SCREENING_LABEL,
} from "@/lib/payments/pricing";

export type CheckoutInput = {
  applicationId: string;
  confirmationId: string;
  email: string;
  listingId: string;
  origin: string;
};

/**
 * Stripe-hosted Checkout for the applicant-paid screening fee. Card details are
 * entered on Stripe's page and never reach this app, so nothing here is in PCI
 * scope. The price is built inline rather than referencing a dashboard Price id
 * so a fresh Stripe account works with only a secret key.
 */
export async function createCheckoutSession(input: CheckoutInput): Promise<{ url: string }> {
  if (!liveChargesAllowed()) {
    throw new Error(LIVE_CHARGES_BLOCKED_MESSAGE);
  }

  const stripe = getStripe();
  if (!stripe) throw new Error("STRIPE_SECRET_KEY is not set");

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: input.email,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: STANDARD_SCREENING_FEE_CENTS,
          product_data: {
            name: STANDARD_SCREENING_LABEL,
            description: STANDARD_SCREENING_DESCRIPTION,
          },
        },
      },
    ],
    // The webhook is the source of truth; these carry the link back to the row.
    client_reference_id: input.applicationId,
    metadata: {
      applicationId: input.applicationId,
      confirmationId: input.confirmationId,
      listingId: input.listingId,
    },
    payment_intent_data: {
      metadata: { applicationId: input.applicationId },
    },
    success_url: `${input.origin}/apply/${input.listingId}?checkout=success&application=${input.applicationId}`,
    cancel_url: `${input.origin}/apply/${input.listingId}?checkout=cancelled&application=${input.applicationId}`,
  });

  if (!session.url) throw new Error("Stripe did not return a checkout URL");

  await attachCheckoutSession(input.applicationId, session.id);

  return { url: session.url };
}
