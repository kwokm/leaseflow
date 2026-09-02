import "server-only";

import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { clerkEnabled, isDemoMode } from "@/lib/config/env";
import { getDb } from "@/lib/db/client";
import { users, type UserRow } from "@/lib/db/schema";
import { isRole, roleFrom, type Role } from "@/lib/auth/roles";
import { newId } from "@/lib/ids";

export type Viewer = {
  clerkUserId: string;
  email: string;
  role: Role;
  firstName: string | null;
  lastName: string | null;
  /** Null when Neon is not configured or would not answer — the identity is still valid. */
  user: UserRow | null;
  /**
   * True when `user` is null because Neon failed, as opposed to not being
   * configured. Callers use it to say "we could not look" instead of drawing an
   * empty desk the signed-in landlord would read as "you have nothing".
   */
  storageUnavailable: boolean;
};

/**
 * Clerk's `auth()` throws when the middleware has not run or keys are absent,
 * so every entry point goes through this guard rather than calling it directly.
 */
export async function clerkUserId(): Promise<string | null> {
  if (!clerkEnabled()) return null;
  const { userId } = await auth();
  return userId ?? null;
}

/**
 * Resolves the signed-in Clerk user and mirrors them into Neon so listings and
 * applications have a stable owner row to hang off. Returns null when nobody is
 * signed in (including demo mode, where the desk is deliberately open).
 */
export async function getViewer(defaultRole: Role = "renter"): Promise<Viewer | null> {
  if (!clerkEnabled()) return null;

  const clerk = await currentUser();
  if (!clerk) return null;

  const email =
    clerk.primaryEmailAddress?.emailAddress ??
    clerk.emailAddresses[0]?.emailAddress ??
    "";
  const role = roleFrom(clerk.publicMetadata?.role, defaultRole);

  // First landing decides the role: the desk stamps "landlord", the apply flow
  // stamps "renter". Once set in Clerk metadata it is never overwritten here.
  if (!isRole(clerk.publicMetadata?.role)) {
    await stampRole(clerk.id, role);
  }

  const viewer: Viewer = {
    clerkUserId: clerk.id,
    email,
    role,
    firstName: clerk.firstName,
    lastName: clerk.lastName,
    user: null,
    storageUnavailable: false,
  };

  // The identity is Clerk's; Neon only mirrors it. A database failure here must
  // not cost the landlord their session — it leaves `user` null, which the
  // callers already treat as "nothing to scope a query by".
  try {
    viewer.user = await syncUser(viewer);
  } catch (error) {
    console.error("[auth] Could not mirror the Clerk user into Neon.", error);
    viewer.storageUnavailable = true;
  }

  return viewer;
}

/**
 * Best-effort: a failure to write metadata must not block sign-in, because the
 * role is re-derived from the entry point on the next request anyway.
 */
async function stampRole(userId: string, role: Role): Promise<void> {
  try {
    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, { publicMetadata: { role } });
  } catch {
    // Non-fatal — see above.
  }
}

/** Upsert on clerk_user_id so repeat visits do not create duplicate rows. */
async function syncUser(viewer: Viewer): Promise<UserRow | null> {
  const database = getDb();
  if (!database) return null;

  const [existing] = await database
    .select()
    .from(users)
    .where(eq(users.clerkUserId, viewer.clerkUserId))
    .limit(1);

  if (existing) {
    const [updated] = await database
      .update(users)
      .set({
        email: viewer.email || existing.email,
        firstName: viewer.firstName ?? existing.firstName,
        lastName: viewer.lastName ?? existing.lastName,
        role: viewer.role,
        updatedAt: new Date(),
      })
      .where(eq(users.id, existing.id))
      .returning();
    return updated ?? existing;
  }

  const [created] = await database
    .insert(users)
    .values({
      id: newId("usr"),
      clerkUserId: viewer.clerkUserId,
      email: viewer.email,
      role: viewer.role,
      firstName: viewer.firstName,
      lastName: viewer.lastName,
    })
    .returning();

  return created ?? null;
}

/**
 * Desk access. Demo mode returns null so the ungated preview still renders;
 * production relies on middleware having already required a session, and this
 * is the second gate for anything that reads landlord-scoped data.
 */
export async function getDeskViewer(): Promise<Viewer | null> {
  if (isDemoMode()) return null;
  return getViewer("landlord");
}
