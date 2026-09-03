/**
 * Live card charges stay off until counsel clears Cal. Civ. Code § 1950.6.
 * A live Stripe key (`sk_live_…`) cannot create Checkout unless
 * `LEASEPROOF_LIVE_FEES=1`. Test keys are unchanged.
 */

function flag(value: string | undefined): boolean {
  return value === "1" || value === "true";
}

export function stripeKeyIsLive(secretKey: string | undefined): boolean {
  return (secretKey ?? "").startsWith("sk_live_");
}

export function liveFeesFlagOn(value: string | undefined): boolean {
  return flag(value);
}

/** False only when a live secret key is present and the live-fees flag is off. */
export function liveChargesAllowed(input: {
  stripeSecretKey?: string;
  liveFees?: string;
}): boolean {
  if (!stripeKeyIsLive(input.stripeSecretKey)) return true;
  return liveFeesFlagOn(input.liveFees);
}

export const LIVE_CHARGES_BLOCKED_MESSAGE =
  "Live charges are off. This private beta uses Stripe test mode only.";
