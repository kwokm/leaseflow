import {
  LANDLORD_SESSION_COOKIE,
  LANDLORD_SESSION_MAX_AGE,
} from "@/lib/auth/constants";

export const LANDLORD_AUTH_HREF = "/signin";

export type LandlordProvider = "google" | "email";

export type LandlordProfile = {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  company: string;
};

export type LandlordSession = LandlordProfile & {
  provider: LandlordProvider;
  signedInAt: string;
};

const SESSION_KEY = "leaseproof.landlord.session";
const PROFILES_KEY = "leaseproof.landlord.profiles";

const listeners = new Set<() => void>();
let cachedSession: LandlordSession | null = null;
let cachedSessionRaw: string | null = null;

function emit() {
  listeners.forEach((listener) => listener());
}

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

function writeSessionCookie(active: boolean) {
  if (typeof document === "undefined") return;
  document.cookie = active
    ? `${LANDLORD_SESSION_COOKIE}=1; Path=/; Max-Age=${LANDLORD_SESSION_MAX_AGE}; SameSite=Lax`
    : `${LANDLORD_SESSION_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
}

export function subscribeLandlordSession(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getLandlordSession(): LandlordSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (raw === cachedSessionRaw) {
      if (cachedSession) writeSessionCookie(true);
      return cachedSession;
    }
    cachedSessionRaw = raw;
    const parsed = raw ? (JSON.parse(raw) as LandlordSession) : null;
    cachedSession = parsed?.email ? parsed : null;
    if (cachedSession) writeSessionCookie(true);
    return cachedSession;
  } catch {
    cachedSession = null;
    cachedSessionRaw = null;
    return null;
  }
}

export function getLandlordProfile(email: string): LandlordProfile | null {
  const profiles = readJson<Record<string, LandlordProfile>>(PROFILES_KEY, {});
  return profiles[email.trim().toLowerCase()] ?? null;
}

export function saveLandlordProfile(profile: LandlordProfile) {
  const key = profile.email.trim().toLowerCase();
  const profiles = readJson<Record<string, LandlordProfile>>(PROFILES_KEY, {});
  profiles[key] = { ...profile, email: key };
  writeJson(PROFILES_KEY, profiles);
}

export function signInLandlord(
  profile: LandlordProfile,
  provider: LandlordProvider
): LandlordSession {
  const session: LandlordSession = {
    ...profile,
    email: profile.email.trim().toLowerCase(),
    company: profile.company.trim(),
    provider,
    signedInAt: new Date().toISOString(),
  };
  writeJson(SESSION_KEY, session);
  cachedSession = session;
  cachedSessionRaw = JSON.stringify(session);
  writeSessionCookie(true);
  saveLandlordProfile(session);
  emit();
  return session;
}

export function signOutLandlord() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SESSION_KEY);
  writeSessionCookie(false);
  cachedSession = null;
  cachedSessionRaw = null;
  emit();
}

/** Only desk-relative paths. Anything else falls back to the realtor desk. */
export function safeDeskNext(next: string | null | undefined): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return "/dashboard";
  if (next.startsWith("/signin") || next.startsWith("/signup")) return "/dashboard";
  if (next.includes("://") || next.includes("\\")) return "/dashboard";
  return next;
}

export const MOCK_GOOGLE_LANDLORD: LandlordProfile = {
  email: "jordan.lee@gmail.com",
  firstName: "Jordan",
  lastName: "Lee",
  phone: "(714) 555-0142",
  company: "",
};
