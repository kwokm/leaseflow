import {
  BIO_MAX_CHARS,
  SOCIAL_NETWORKS,
  type ApplicantBio,
  type SocialNetwork,
  type SocialPostView,
} from "../apply/types.ts";
import type { ApplicantProfileView } from "../data/mock-data.ts";

export const MAX_SOCIAL_POSTS = 9;

export const SOCIAL_CONSENT_LABEL =
  "Share these posts with this landlord for this application.";

export const SOCIAL_READ_COPY = "Read from your profiles, not verified.";

export const FACEBOOK_PERSONAL_MESSAGE =
  "Posts cannot be imported from a personal Facebook profile. The landlord will see the profile link.";

export const TOKEN_KEYS = [
  "access_token",
  "accessToken",
  "refresh_token",
  "refreshToken",
  "token",
  "client_secret",
  "clientSecret",
  "app_secret",
  "appSecret",
] as const;

export type SnapshotInput = {
  permalink?: string | null;
  caption?: string | null;
  takenAt?: string | Date | number | null;
  mediaType?: string | null;
  thumbUrl?: string | null;
};

export function capSocialPosts<T>(posts: T[]): T[] {
  return posts.slice(0, MAX_SOCIAL_POSTS);
}

export function takenAtIso(value: string | Date | number | null | undefined): string | null {
  if (value == null || value === "") return null;
  if (typeof value === "number") {
    const ms = value < 1e12 ? value * 1000 : value;
    const date = new Date(ms);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export function toSocialPostView(
  network: SocialNetwork,
  position: number,
  input: SnapshotInput,
): SocialPostView | null {
  const permalink = typeof input.permalink === "string" ? input.permalink.trim() : "";
  if (!permalink) return null;
  return {
    network,
    position,
    permalink,
    caption: (input.caption ?? "").toString().slice(0, 280),
    takenAt: takenAtIso(input.takenAt),
    thumbUrl: input.thumbUrl || undefined,
    mediaType: (input.mediaType ?? "image").toString(),
  };
}

/** Keep real posts only — never invent or pad to fill a 3×3. */
export function snapshotPosts(
  network: SocialNetwork,
  items: SnapshotInput[],
): SocialPostView[] {
  const posts: SocialPostView[] = [];
  for (const item of capSocialPosts(items)) {
    const view = toSocialPostView(network, posts.length + 1, item);
    if (view) posts.push(view);
  }
  return posts;
}

export function hasTokenLeak(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  const seen = new Set<unknown>();
  const walk = (node: unknown): boolean => {
    if (!node || typeof node !== "object") return false;
    if (seen.has(node)) return false;
    seen.add(node);
    if (Array.isArray(node)) return node.some(walk);
    for (const [key, child] of Object.entries(node as Record<string, unknown>)) {
      if (TOKEN_KEYS.includes(key as (typeof TOKEN_KEYS)[number])) return true;
      if (walk(child)) return true;
    }
    return false;
  };
  return walk(value);
}

export function publicSocialPost(post: SocialPostView, position = post.position): SocialPostView {
  return {
    network: post.network,
    position,
    permalink: post.permalink,
    caption: post.caption,
    takenAt: post.takenAt,
    thumbUrl: post.thumbUrl,
    mediaType: post.mediaType,
  };
}

export function publicSocialAccount(account: {
  network: SocialNetwork;
  profileUrl?: string;
  handle?: string;
  connected?: boolean;
  personalProfile?: boolean;
  posts?: SocialPostView[];
}): {
  network: SocialNetwork;
  profileUrl: string;
  handle: string;
  connected: boolean;
  personalProfile?: boolean;
  posts: SocialPostView[];
} {
  const posts = capSocialPosts(account.posts ?? []).map((post, index) =>
    publicSocialPost(post, index + 1)
  );
  return {
    network: account.network,
    profileUrl: account.profileUrl ?? "",
    handle: account.handle ?? "",
    connected: Boolean(account.connected),
    personalProfile: account.personalProfile || undefined,
    posts,
  };
}

export function socialConfigured(env: NodeJS.ProcessEnv = process.env): {
  instagram: boolean;
  tiktok: boolean;
  facebook: boolean;
} {
  const meta = Boolean(env.META_APP_ID?.trim() && env.META_APP_SECRET?.trim());
  return {
    instagram: meta,
    facebook: meta,
    tiktok: Boolean(env.TIKTOK_CLIENT_KEY?.trim() && env.TIKTOK_CLIENT_SECRET?.trim()),
  };
}

export function notConfiguredMessage(network: SocialNetwork): string {
  const label = network === "tiktok" ? "TikTok" : network === "facebook" ? "Facebook" : "Instagram";
  return `${label} Connect is not configured yet. You can still save a public profile URL as a link.`;
}

function photoUrlFromBio(bio: ApplicantBio | undefined): string | undefined {
  if (!bio?.photo) return undefined;
  if (bio.photo.storedUrl) return bio.photo.storedUrl;
  if (bio.photo.pathname) return `/api/uploads/file?path=${encodeURIComponent(bio.photo.pathname)}`;
  return undefined;
}

function accountFromUnknown(network: SocialNetwork, value: unknown) {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  const pub = publicSocialAccount({
    network,
    profileUrl: typeof row.profileUrl === "string" ? row.profileUrl : "",
    handle: typeof row.handle === "string" ? row.handle : "",
    connected: Boolean(row.connected),
    personalProfile: Boolean(row.personalProfile),
    posts: Array.isArray(row.posts) ? (row.posts as SocialPostView[]) : [],
  });
  if (!pub.profileUrl && !pub.handle && !pub.posts.length && !pub.connected) return null;
  return pub;
}

/** Public social rows from a stored packet. Never pads; never copies tokens. */
export function socialFromStoredPacket(packet: unknown): ApplicantProfileView["social"] {
  if (!packet || typeof packet !== "object") return [];
  const bio = (packet as { bio?: { social?: unknown } }).bio;
  if (!bio?.social || typeof bio.social !== "object") return [];
  const social = bio.social as Record<string, unknown>;
  return SOCIAL_NETWORKS.map((network) => accountFromUnknown(network, social[network])).filter(
    (row): row is NonNullable<typeof row> => Boolean(row)
  );
}

/** Packet-safe bio. Tokens and extra keys are dropped. */
export function publicApplicantBio(bio: ApplicantBio): ApplicantBio {
  return {
    photo: bio.photo,
    text: (bio.text ?? "").slice(0, BIO_MAX_CHARS),
    socialConsent: Boolean(bio.socialConsent),
    socialConsentAt: bio.socialConsentAt,
    draftId: bio.draftId ?? "",
    social: {
      instagram: publicSocialAccount(bio.social?.instagram ?? { network: "instagram", profileUrl: "", handle: "", connected: false, posts: [] }),
      tiktok: publicSocialAccount(bio.social?.tiktok ?? { network: "tiktok", profileUrl: "", handle: "", connected: false, posts: [] }),
      facebook: publicSocialAccount(bio.social?.facebook ?? { network: "facebook", profileUrl: "", handle: "", connected: false, posts: [] }),
    },
  };
}

/** Apply-state bio → landlord view. Used for local submissions and packet merge. */
export function profileFromApplyBio(bio: ApplicantBio | undefined): ApplicantProfileView | undefined {
  if (!bio) return undefined;
  const social = SOCIAL_NETWORKS.map((network) =>
    accountFromUnknown(network, bio.social?.[network])
  ).filter((row): row is NonNullable<typeof row> => Boolean(row));
  const photoUrl = photoUrlFromBio(bio);
  const text = (bio.text ?? "").slice(0, BIO_MAX_CHARS);
  if (!photoUrl && !text && !social.length) return undefined;
  return { photoUrl, bio: text, social };
}

/**
 * Neon profile wins per network; packet URL-only links fill gaps so a typed
 * Instagram URL still shows when Connect was never configured.
 */
export function mergeApplicantProfile(
  stored: ApplicantProfileView | undefined,
  packet: unknown
): ApplicantProfileView | undefined {
  const fromPacket = socialFromStoredPacket(packet);
  const packetBio =
    packet && typeof packet === "object"
      ? String((packet as { bio?: { text?: string } }).bio?.text ?? "")
      : "";
  const packetPhoto =
    packet && typeof packet === "object"
      ? photoUrlFromBio((packet as { bio?: ApplicantBio }).bio)
      : undefined;

  if (!stored && !fromPacket.length && !packetBio && !packetPhoto) return undefined;

  const byNetwork = new Map<SocialNetwork, ApplicantProfileView["social"][number]>();
  for (const account of fromPacket) byNetwork.set(account.network, account);
  for (const account of stored?.social ?? []) byNetwork.set(account.network, account);

  return {
    photoUrl: stored?.photoUrl || packetPhoto,
    bio: (stored?.bio || packetBio).slice(0, BIO_MAX_CHARS),
    sample: stored?.sample,
    social: SOCIAL_NETWORKS.map((network) => byNetwork.get(network)).filter(
      (row): row is NonNullable<typeof row> => Boolean(row)
    ),
  };
}
