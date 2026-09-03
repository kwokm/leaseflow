import "server-only";

import { and, eq, inArray } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import {
  applicantProfiles,
  socialConnections,
  socialPostSnapshots,
  type SocialPostSnapshotRow,
} from "@/lib/db/schema";
import { newId } from "@/lib/ids";
import type { ApplicantBio } from "@/lib/apply/types";
import {
  BIO_MAX_CHARS,
  SOCIAL_NETWORKS,
  publicSocialAccount,
  publicSocialPost,
  snapshotPosts,
  type ApplicantProfileView,
  type SocialNetwork,
  type SocialPostView,
} from "@/lib/social/snapshot";

function thumbUrl(blobPath: string | null): string | undefined {
  if (!blobPath) return undefined;
  return `/api/uploads/file?path=${encodeURIComponent(blobPath)}`;
}

function photoUrl(path: string | null): string | undefined {
  if (!path) return undefined;
  if (path.startsWith("/api/uploads/")) return path;
  return `/api/uploads/file?path=${encodeURIComponent(path)}`;
}

function postsToView(rows: SocialPostSnapshotRow[]): SocialPostView[] {
  return snapshotPosts(
    (rows[0]?.network as SocialNetwork) ?? "instagram",
    rows
      .slice()
      .sort((a, b) => a.position - b.position)
      .map((row) => ({
        permalink: row.permalink,
        caption: row.caption,
        takenAt: row.takenAt,
        mediaType: row.mediaType,
        thumbUrl: thumbUrl(row.blobPath),
      }))
  ).map((post, index) => publicSocialPost(post, index + 1));
}

export async function profilesByApplication(
  applicationIds: string[]
): Promise<Map<string, ApplicantProfileView>> {
  const database = getDb();
  const out = new Map<string, ApplicantProfileView>();
  if (!database || !applicationIds.length) return out;

  const [profiles, connections, snaps] = await Promise.all([
    database
      .select()
      .from(applicantProfiles)
      .where(inArray(applicantProfiles.applicationId, applicationIds)),
    database
      .select({
        applicationId: socialConnections.applicationId,
        network: socialConnections.network,
        handle: socialConnections.handle,
        profileUrl: socialConnections.profileUrl,
        personalProfile: socialConnections.personalProfile,
      })
      .from(socialConnections)
      .where(inArray(socialConnections.applicationId, applicationIds)),
    database
      .select()
      .from(socialPostSnapshots)
      .where(inArray(socialPostSnapshots.applicationId, applicationIds)),
  ]);

  const snapsByApp = new Map<string, SocialPostSnapshotRow[]>();
  for (const row of snaps) {
    if (!row.applicationId) continue;
    const list = snapsByApp.get(row.applicationId) ?? [];
    list.push(row);
    snapsByApp.set(row.applicationId, list);
  }

  for (const id of applicationIds) {
    const profile = profiles.find((row) => row.applicationId === id);
    const appSnaps = snapsByApp.get(id) ?? [];
    const social = SOCIAL_NETWORKS.map((network) => {
      const connection = connections.find(
        (row) => row.applicationId === id && row.network === network
      );
      const posts = postsToView(appSnaps.filter((row) => row.network === network));
      if (!connection && !posts.length) return null;
      return publicSocialAccount({
        network,
        profileUrl: connection?.profileUrl ?? "",
        handle: connection?.handle ?? "",
        connected: Boolean(connection),
        personalProfile: connection?.personalProfile || undefined,
        posts,
      });
    }).filter((row): row is NonNullable<typeof row> => Boolean(row));

    if (!profile && !social.length) continue;
    out.set(id, {
      photoUrl: photoUrl(profile?.photoBlobPath ?? null),
      bio: (profile?.bio ?? "").slice(0, BIO_MAX_CHARS),
      social,
    });
  }

  return out;
}

export async function saveApplicantProfile(
  applicationId: string,
  listingId: string | null,
  bio: ApplicantBio | undefined
): Promise<void> {
  const database = getDb();
  if (!database || !bio) return;

  const now = new Date();
  const photoPath = bio.photo?.pathname ?? null;
  const text = (bio.text ?? "").slice(0, BIO_MAX_CHARS);
  const consentAt = bio.socialConsent
    ? bio.socialConsentAt
      ? new Date(bio.socialConsentAt)
      : now
    : null;

  const [existing] = await database
    .select()
    .from(applicantProfiles)
    .where(eq(applicantProfiles.applicationId, applicationId))
    .limit(1);

  if (existing) {
    await database
      .update(applicantProfiles)
      .set({
        listingId: listingId ?? existing.listingId,
        photoBlobPath: photoPath ?? existing.photoBlobPath,
        bio: text,
        socialConsentAt: consentAt,
        draftId: bio.draftId || existing.draftId,
        updatedAt: now,
      })
      .where(eq(applicantProfiles.id, existing.id));
  } else {
    await database.insert(applicantProfiles).values({
      id: newId("prf"),
      applicationId,
      listingId,
      draftId: bio.draftId || null,
      photoBlobPath: photoPath,
      bio: text,
      socialConsentAt: consentAt,
    });
  }

  if (bio.draftId) {
    await database
      .update(socialConnections)
      .set({ applicationId, updatedAt: now })
      .where(and(eq(socialConnections.draftId, bio.draftId)));
    await database
      .update(socialPostSnapshots)
      .set({ applicationId })
      .where(eq(socialPostSnapshots.draftId, bio.draftId));
  }
}

export async function publicProfileForDraft(draftId: string): Promise<ApplicantProfileView | null> {
  const database = getDb();
  if (!database || !draftId) return null;

  const connections = await database
    .select({
      network: socialConnections.network,
      handle: socialConnections.handle,
      profileUrl: socialConnections.profileUrl,
      personalProfile: socialConnections.personalProfile,
    })
    .from(socialConnections)
    .where(eq(socialConnections.draftId, draftId));

  const snaps = await database
    .select()
    .from(socialPostSnapshots)
    .where(eq(socialPostSnapshots.draftId, draftId));

  const social = SOCIAL_NETWORKS.map((network) => {
    const connection = connections.find((row) => row.network === network);
    const posts = postsToView(snaps.filter((row) => row.network === network));
    if (!connection && !posts.length) return null;
    return publicSocialAccount({
      network,
      profileUrl: connection?.profileUrl ?? "",
      handle: connection?.handle ?? "",
      connected: Boolean(connection),
      personalProfile: connection?.personalProfile || undefined,
      posts,
    });
  }).filter((row): row is NonNullable<typeof row> => Boolean(row));

  if (!social.length) return null;
  return { bio: "", social };
}
