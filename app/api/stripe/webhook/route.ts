import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe, stripeWebhookSecret } from "@/lib/payments/stripe";
import { markPaid } from "@/lib/applications/service";

// The signature is checked against the raw body, so this must not be cached or
// pre-parsed.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Payment confirmation. This is the only thing that flips an application to
 * paid, and therefore the only thing that releases the Experian Connect share —
 * a client-side return from Checkout is never trusted.
 */
export async function POST(request: Request) {
  const stripe = getStripe();
  const secret = stripeWebhookSecret();

  if (!stripe || !secret) {
    return NextResponse.json({ error: "Stripe is not configured." }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature." }, { status: 400 });
  }

  const payload = await request.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(payload, signature, secret);
  } catch {
    // Do not echo the reason: an unverified caller gets nothing back.
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.payment_status === "paid") {
      const paymentIntentId =
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : (session.payment_intent?.id ?? null);
      await markPaid(session.id, paymentIntentId);
    }
  }

  // Everything else is acknowledged so Stripe stops retrying.
  return NextResponse.json({ received: true });
}
