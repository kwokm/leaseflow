/**
 * Invite-only landlord desk. Applicants are not on this list — they open an
 * apply link the landlord sends. An empty production list means nobody new
 * gets a desk; demo is the only place the two known OC emails are implied.
 */

export const DEFAULT_DEMO_LANDLORD_EMAILS = [
  "michaelgkwok@gmail.com",
  "aaisuzukillc@gmail.com",
] as const;

export const PRIVATE_BETA_MESSAGE =
  "Leaseproof is in a private Orange County beta. The landlord desk is invite-only. Ask the team to add your email.";

function flag(value: string | undefined): boolean {
  return value === "1" || value === "true";
}

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

/**
 * Parse `LEASEPROOF_BETA_EMAILS`. Unset or whitespace-only:
 * - demo → the two known OC landlord emails
 * - production → nobody
 *
 * An explicit comma-separated list always wins, including in demo.
 */
export function parseBetaEmails(
  raw: string | undefined,
  demo: boolean
): string[] {
  if (raw == null || raw.trim() === "") {
    return demo ? [...DEFAULT_DEMO_LANDLORD_EMAILS] : [];
  }

  return raw
    .split(",")
    .map(normalizeEmail)
    .filter(Boolean);
}

export function landlordBetaEmails(
  env: NodeJS.ProcessEnv = process.env
): string[] {
  return parseBetaEmails(env.LEASEPROOF_BETA_EMAILS, flag(env.LEASEPROOF_DEMO));
}

export function isLandlordEmailAllowed(
  email: string,
  emails: string[] = landlordBetaEmails()
): boolean {
  const normalized = normalizeEmail(email);
  if (!normalized) return false;
  return emails.includes(normalized);
}
