import "server-only";

import { and, eq } from "drizzle-orm";
import { put } from "@vercel/blob";
import { appOrigin, blobEnabled } from "@/lib/config/env";
import { getDb } from "@/lib/db/client";
import { socialConnections, socialPostSnapshots } from "@/lib/db/schema";
import { newId } from "@/lib/ids";
import type { SocialNetwork } from "@/lib/apply/types";
import {
  FACEBOOK_PERSONAL_MESSAGE,
  notConfiguredMessage,
  snapshotPosts,
  socialConfigured,
  type SnapshotInput,
} from "@/lib/social/snapshot";

export class SocialOAuthError extends Error {
  status = 400;
  constructor(message: string, status = 400) {
    super(message);
    this.name = "SocialOAuthError";
    this.status = status;
  }
}

export function networkConfigured(network: SocialNetwork): boolean {
  return socialConfigured()[network];
}

export function authorizeUrl(network: SocialNetwork, state: string): string {
  const origin = appOrigin();
  const redirect = `${origin}/api/apply/social/${network}/callback`;
  if (network === "tiktok") {
    const key = process.env.TIKTOK_CLIENT_KEY ?? "";
    const url = new URL("https://www.tiktok.com/v2/auth/authorize/");
    url.searchParams.set("client_key", key);
    url.searchParams.set("scope", "user.info.basic,video.list");
    url.searchParams.set("response_type", "code");
    url.searchParams.set("redirect_uri", redirect);
    url.searchParams.set("state", state);
    return url.toString();
  }

  const id = process.env.META_APP_ID ?? "";
  if (network === "instagram") {
    const url = new URL("https://www.instagram.com/oauth/authorize");
    url.searchParams.set("client_id", id);
    url.searchParams.set("redirect_uri", redirect);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", "instagram_business_basic");
    url.searchParams.set("state", state);
    return url.toString();
  }

  const url = new URL("https://www.facebook.com/v21.0/dialog/oauth");
  url.searchParams.set("client_id", id);
  url.searchParams.set("redirect_uri", redirect);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "pages_show_list,pages_read_engagement");
  url.searchParams.set("state", state);
  return url.toString();
}

async function copyThumb(url: string | undefined, network: SocialNetwork): Promise<string | null> {
  if (!url || !blobEnabled()) return null;
  try {
    const response = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(8000) });
    if (!response.ok) return null;
    const type = response.headers.get("content-type") ?? "image/jpeg";
    if (!type.startsWith("image/")) return null;
    const bytes = Buffer.from(await response.arrayBuffer());
    const blob = await put(`applications/social/${network}/${newId("soc")}.jpg`, bytes, {
      access: "private",
      addRandomSuffix: true,
      contentType: type,
    });
    return blob.pathname;
  } catch {
    return null;
  }
}

async function instagramMedia(token: string): Promise<{ handle: string; profileUrl: string; items: SnapshotInput[] }> {
  const me = await fetch(
    `https://graph.instagram.com/me?fields=id,username&access_token=${encodeURIComponent(token)}`
  );
  const profile = (await me.json().catch(() => ({}))) as { username?: string };
  const handle = profile.username ?? "";
  const media = await fetch(
    `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,timestamp,thumbnail_url&limit=9&access_token=${encodeURIComponent(token)}`
  );
  const payload = (await media.json().catch(() => ({}))) as {
    data?: Array<{
      permalink?: string;
      caption?: string;
      timestamp?: string;
      media_type?: string;
      media_url?: string;
      thumbnail_url?: string;
    }>;
  };
  return {
    handle,
    profileUrl: handle ? `https://www.instagram.com/${handle}` : "",
    items: (payload.data ?? []).map((row) => ({
      permalink: row.permalink,
      caption: row.caption,
      takenAt: row.timestamp,
      mediaType: row.media_type,
      thumbUrl: row.thumbnail_url || row.media_url,
    })),
  };
}

async function tiktokMedia(token: string): Promise<{ handle: string; profileUrl: string; items: SnapshotInput[] }> {
  const me = await fetch("https://open.tiktokapis.com/v2/user/info/?fields=display_name,username", {
    headers: { authorization: `Bearer ${token}` },
  });
  const profile = (await me.json().catch(() => ({}))) as {
    data?: { user?: { username?: string } };
  };
  const handle = profile.data?.user?.username ?? "";
  const videos = await fetch(
    "https://open.tiktokapis.com/v2/video/list/?fields=id,title,cover_image_url,create_time,share_url",
    {
      method: "POST",
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      body: JSON.stringify({ max_count: 9 }),
    }
  );
  const payload = (await videos.json().catch(() => ({}))) as {
    data?: {
      videos?: Array<{
        title?: string;
        cover_image_url?: string;
        create_time?: number;
        share_url?: string;
      }>;
    };
  };
  return {
    handle,
    profileUrl: handle ? `https://www.tiktok.com/@${handle}` : "",
    items: (payload.data?.videos ?? []).map((row) => ({
      permalink: row.share_url,
      caption: row.title,
      takenAt: row.create_time,
      mediaType: "video",
      thumbUrl: row.cover_image_url,
    })),
  };
}

async function facebookPages(
  token: string
): Promise<{ handle: string; profileUrl: string; personalProfile: boolean; items: SnapshotInput[] }> {
  const pagesRes = await fetch(
    `https://graph.facebook.com/v21.0/me/accounts?fields=id,name,access_token&access_token=${encodeURIComponent(token)}`
  );
  const pages = (await pagesRes.json().catch(() => ({}))) as {
    data?: Array<{ id?: string; name?: string; access_token?: string }>;
  };
  const page = pages.data?.[0];
  if (!page?.id || !page.access_token) {
    return { handle: "", profileUrl: "", personalProfile: true, items: [] };
  }
  const postsRes = await fetch(
    `https://graph.facebook.com/v21.0/${page.id}/posts?fields=permalink_url,message,created_time,full_picture&limit=9&access_token=${encodeURIComponent(page.access_token)}`
  );
  const posts = (await postsRes.json().catch(() => ({}))) as {
    data?: Array<{ permalink_url?: string; message?: string; created_time?: string; full_picture?: string }>;
  };
  return {
    handle: page.name ?? "",
    profileUrl: `https://www.facebook.com/${page.id}`,
    personalProfile: false,
    items: (posts.data ?? []).map((row) => ({
      permalink: row.permalink_url,
      caption: row.message,
      takenAt: row.created_time,
      mediaType: "image",
      thumbUrl: row.full_picture,
    })),
  };
}

export async function exchangeAndSnapshot(input: {
  network: SocialNetwork;
  code: string;
  draftId: string;
  listingId: string | null;
}): Promise<{ handle: string; profileUrl: string; personalProfile?: boolean; note?: string }> {
  if (!networkConfigured(input.network)) {
    throw new SocialOAuthError(notConfiguredMessage(input.network), 503);
  }

  const origin = appOrigin();
  const redirect = `${origin}/api/apply/social/${input.network}/callback`;
  let accessToken = "";
  let refreshToken: string | null = null;
  let expiresAt: Date | undefined;
  let handle = "";
  let profileUrl = "";
  let personalProfile = false;
  let items: SnapshotInput[] = [];

  if (input.network === "tiktok") {
    const tokenRes = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_key: process.env.TIKTOK_CLIENT_KEY ?? "",
        client_secret: process.env.TIKTOK_CLIENT_SECRET ?? "",
        code: input.code,
        grant_type: "authorization_code",
        redirect_uri: redirect,
      }),
    });
    const token = (await tokenRes.json().catch(() => ({}))) as {
      access_token?: string;
      refresh_token?: string;
      expires_in?: number;
    };
    if (!token.access_token) throw new SocialOAuthError("TikTok did not return an access token.");
    accessToken = token.access_token;
    refreshToken = token.refresh_token ?? null;
    if (token.expires_in) expiresAt = new Date(Date.now() + token.expires_in * 1000);
    const media = await tiktokMedia(accessToken);
    handle = media.handle;
    profileUrl = media.profileUrl;
    items = media.items;
  } else {
    let token: { access_token?: string; expires_in?: number } = {};
    if (input.network === "facebook") {
      const url = new URL("https://graph.facebook.com/v21.0/oauth/access_token");
      url.searchParams.set("client_id", process.env.META_APP_ID ?? "");
      url.searchParams.set("client_secret", process.env.META_APP_SECRET ?? "");
      url.searchParams.set("redirect_uri", redirect);
      url.searchParams.set("code", input.code);
      const fbToken = await fetch(url);
      token = (await fbToken.json().catch(() => ({}))) as { access_token?: string; expires_in?: number };
    } else {
      const body = new FormData();
      body.set("client_id", process.env.META_APP_ID ?? "");
      body.set("client_secret", process.env.META_APP_SECRET ?? "");
      body.set("grant_type", "authorization_code");
      body.set("redirect_uri", redirect);
      body.set("code", input.code);
      const tokenRes = await fetch("https://api.instagram.com/oauth/access_token", {
        method: "POST",
        body,
      });
      token = (await tokenRes.json().catch(() => ({}))) as { access_token?: string; expires_in?: number };
    }
    if (!token.access_token) {
      throw new SocialOAuthError("That network did not return an access token.");
    }
    accessToken = token.access_token;
    if (token.expires_in) expiresAt = new Date(Date.now() + token.expires_in * 1000);
    if (input.network === "instagram") {
      const media = await instagramMedia(accessToken);
      handle = media.handle;
      profileUrl = media.profileUrl;
      items = media.items;
    } else {
      const media = await facebookPages(accessToken);
      handle = media.handle;
      profileUrl = media.profileUrl;
      personalProfile = media.personalProfile;
      items = media.items;
    }
  }

  const database = getDb();
  if (!database) throw new SocialOAuthError("Set DATABASE_URL to connect a profile.", 503);

  const [match] = await database
    .select()
    .from(socialConnections)
    .where(
      and(eq(socialConnections.draftId, input.draftId), eq(socialConnections.network, input.network))
    )
    .limit(1);

  const connectionId = match?.id ?? newId("scn");
  const now = new Date();
  if (match) {
    await database
      .update(socialConnections)
      .set({
        accessToken,
        refreshToken,
        tokenExpiresAt: expiresAt,
        handle,
        profileUrl,
        personalProfile,
        listingId: input.listingId,
        updatedAt: now,
      })
      .where(eq(socialConnections.id, match.id));
  } else {
    await database.insert(socialConnections).values({
      id: connectionId,
      draftId: input.draftId,
      listingId: input.listingId,
      network: input.network,
      accessToken,
      refreshToken,
      tokenExpiresAt: expiresAt,
      handle,
      profileUrl,
      personalProfile,
    });
  }

  await database
    .delete(socialPostSnapshots)
    .where(
      and(
        eq(socialPostSnapshots.draftId, input.draftId),
        eq(socialPostSnapshots.network, input.network)
      )
    );

  const posts = snapshotPosts(input.network, items);
  for (const post of posts) {
    const blobPath = await copyThumb(
      items.find((item) => item.permalink === post.permalink)?.thumbUrl,
      input.network
    );
    await database.insert(socialPostSnapshots).values({
      id: newId("sps"),
      draftId: input.draftId,
      network: input.network,
      position: post.position,
      permalink: post.permalink,
      caption: post.caption,
      takenAt: post.takenAt ? new Date(post.takenAt) : null,
      blobPath,
      mediaType: post.mediaType,
    });
  }

  return {
    handle,
    profileUrl,
    personalProfile: personalProfile || undefined,
    note: personalProfile ? FACEBOOK_PERSONAL_MESSAGE : undefined,
  };
}
