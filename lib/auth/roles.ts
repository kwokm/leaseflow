/** Two audiences: the landlord who owns listings, and the renter who applies. */
export type Role = "landlord" | "renter";

export const ROLES: Role[] = ["landlord", "renter"];

export function isRole(value: unknown): value is Role {
  return value === "landlord" || value === "renter";
}

export function roleFrom(value: unknown, fallback: Role): Role {
  return isRole(value) ? value : fallback;
}

export const LANDLORD_SIGN_IN_HREF = "/signin";
export const LANDLORD_SIGN_UP_HREF = "/signup";
export const RENTER_SIGN_IN_HREF = "/signin?role=renter";

export function deskSignUpHref(next?: string | null): string {
  const dest = safeDeskNext(next);
  return dest === "/dashboard" && !next
    ? LANDLORD_SIGN_UP_HREF
    : `${LANDLORD_SIGN_UP_HREF}?next=${encodeURIComponent(dest)}`;
}

/** Branded in-app sign-in, never Clerk's hosted accounts.dev page. */
export function deskSignInHref(next?: string | null): string {
  const dest = safeDeskNext(next);
  return dest === "/dashboard" && !next
    ? LANDLORD_SIGN_IN_HREF
    : `${LANDLORD_SIGN_IN_HREF}?next=${encodeURIComponent(dest)}`;
}

/**
 * Only desk-relative paths survive. Anything absolute, protocol-relative, or
 * pointing back at the auth pages falls back to the desk, so `?next=` cannot be
 * used as an open redirect.
 */
export function safeDeskNext(next: string | null | undefined): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return "/dashboard";
  if (next.startsWith("/signin") || next.startsWith("/signup")) return "/dashboard";
  if (next.includes("://") || next.includes("\\")) return "/dashboard";
  return next;
}
