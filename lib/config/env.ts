import "server-only";

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

export function blobEnabled(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
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
};

/** Snapshot handed to the client so components can branch without env access. */
export function runtimeConfig(): RuntimeConfig {
  return {
    demo: isDemoMode(),
    clerk: clerkEnabled(),
    database: databaseEnabled(),
    stripe: stripeEnabled(),
    blob: blobEnabled(),
  };
}
