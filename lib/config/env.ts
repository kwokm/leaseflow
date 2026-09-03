import "server-only";

import {
  liveChargesAllowed as liveChargesAllowedFrom,
  liveFeesFlagOn,
  stripeKeyIsLive,
} from "@/lib/payments/live-fees";

/**
 * Server-side view of the environment. Every integration is optional at build
 * time so the app compiles and the Vercel preview boots without secrets — each
 * feature degrades to a clearly-labelled fallback instead of throwing.
 */

function flag(value: string | undefined): boolean {
  return value === "1" || value === "true";
}

/**
 * Demo mode seeds the sample Irvine listings and leaves the desk open without a
 * Clerk session so the click-through preview keeps working. It must never be on
 * in production: an unset variable means "real, empty, signed-in".
 */
export function isDemoMode(): boolean {
  return flag(process.env.LEASEPROOF_DEMO);
}

export function clerkEnabled(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY
  );
}

export function databaseEnabled(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export function stripeEnabled(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

/**
 * Live $24.99 charges stay off until this is explicitly `1`. Defaults off.
 * A live Stripe key cannot create Checkout without it.
 */
export function liveFeesEnabled(): boolean {
  return liveFeesFlagOn(process.env.LEASEPROOF_LIVE_FEES);
}

export function stripeIsLiveMode(): boolean {
  return stripeKeyIsLive(process.env.STRIPE_SECRET_KEY);
}

export function liveChargesAllowed(): boolean {
  return liveChargesAllowedFrom({
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
    liveFees: process.env.LEASEPROOF_LIVE_FEES,
  });
}

export function blobEnabled(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

/** True only when a real mailer can accept a message. Absence means queue, never fake a send. */
export function mailerEnabled(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim() && process.env.MAIL_FROM?.trim());
}

/**
 * Absolute origin for Stripe return URLs. Vercel sets VERCEL_URL without a
 * scheme, so it is normalised here.
 */
export function appOrigin(): string {
  const explicit = process.env.NEXT_PUBLIC_APP_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  const vercel = process.env.VERCEL_URL;
  if (vercel) return `https://${vercel.replace(/\/$/, "")}`;
  return "http://localhost:3000";
}

export type RuntimeConfig = {
  demo: boolean;
  clerk: boolean;
  database: boolean;
  stripe: boolean;
  blob: boolean;
  liveFees: boolean;
  stripeLive: boolean;
  social: {
    instagram: boolean;
    tiktok: boolean;
    facebook: boolean;
  };
};

/** Snapshot handed to the client so components can branch without env access. */
export function runtimeConfig(): RuntimeConfig {
  return {
    demo: isDemoMode(),
    clerk: clerkEnabled(),
    database: databaseEnabled(),
    stripe: stripeEnabled(),
    blob: blobEnabled(),
    liveFees: liveFeesEnabled(),
    stripeLive: stripeIsLiveMode(),
    social: {
      instagram: Boolean(process.env.META_APP_ID?.trim() && process.env.META_APP_SECRET?.trim()),
      facebook: Boolean(process.env.META_APP_ID?.trim() && process.env.META_APP_SECRET?.trim()),
      tiktok: Boolean(
        process.env.TIKTOK_CLIENT_KEY?.trim() && process.env.TIKTOK_CLIENT_SECRET?.trim()
      ),
    },
  };
}
