import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import {
  capSocialPosts,
  FACEBOOK_PERSONAL_MESSAGE,
  hasTokenLeak,
  mergeApplicantProfile,
  notConfiguredMessage,
  publicApplicantBio,
  publicSocialAccount,
  snapshotPosts,
  socialConfigured,
} from "./snapshot.ts";

test("snapshot cap is 9 and never pads invented posts", () => {
  const twelve = Array.from({ length: 12 }, (_, index) => ({
    permalink: `https://instagram.com/p/${index + 1}`,
    caption: `post ${index + 1}`,
  }));
  const posts = snapshotPosts("instagram", twelve);
  assert.equal(posts.length, 9);
  assert.equal(posts[0]?.permalink, "https://instagram.com/p/1");
  assert.equal(posts[8]?.position, 9);

  const two = snapshotPosts("tiktok", [
    { permalink: "https://tiktok.com/@x/video/1" },
    { permalink: "https://tiktok.com/@x/video/2" },
  ]);
  assert.equal(two.length, 2);
  assert.equal(capSocialPosts([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]).length, 9);
});

test("missing permalinks are dropped instead of inventing tiles", () => {
  const posts = snapshotPosts("facebook", [
    { caption: "no link" },
    { permalink: "https://facebook.com/page/posts/1", caption: "real" },
    { permalink: "   " },
  ]);
  assert.equal(posts.length, 1);
  assert.equal(posts[0]?.caption, "real");
});

test("unset Meta/TikTok env degrades to a profile-link message", () => {
  const none = socialConfigured({} as NodeJS.ProcessEnv);
  assert.deepEqual(none, { instagram: false, tiktok: false, facebook: false });
  assert.match(notConfiguredMessage("instagram"), /not configured yet/);
  assert.match(FACEBOOK_PERSONAL_MESSAGE, /personal Facebook profile/);

  const both = socialConfigured({
    META_APP_ID: "id",
    META_APP_SECRET: "secret",
    TIKTOK_CLIENT_KEY: "key",
    TIKTOK_CLIENT_SECRET: "secret",
  } as NodeJS.ProcessEnv);
  assert.equal(both.instagram, true);
  assert.equal(both.facebook, true);
  assert.equal(both.tiktok, true);
});

test("packet merge keeps URL-only links and never invents posts or tokens", () => {
  const packet = {
    bio: {
      text: "Quiet household.",
      social: {
        instagram: {
          network: "instagram",
          profileUrl: "https://instagram.com/alex",
          handle: "alex",
          connected: false,
          access_token: "IGQWE",
          posts: [],
        },
      },
    },
  };
  const merged = mergeApplicantProfile(undefined, packet);
  assert.equal(merged?.bio, "Quiet household.");
  assert.equal(merged?.social.length, 1);
  assert.equal(merged?.social[0]?.posts.length, 0);
  assert.equal(hasTokenLeak(merged), false);

  const stored = mergeApplicantProfile(
    {
      bio: "From Neon",
      social: [
        {
          network: "instagram",
          profileUrl: "https://instagram.com/live",
          handle: "live",
          connected: true,
          posts: [
            {
              network: "instagram",
              position: 1,
              permalink: "https://instagram.com/p/1",
              caption: "real",
              takenAt: null,
              mediaType: "IMAGE",
            },
          ],
        },
      ],
    },
    packet
  );
  assert.equal(stored?.bio, "From Neon");
  assert.equal(stored?.social[0]?.handle, "live");
  assert.equal(stored?.social[0]?.posts.length, 1);
});

test("public social views never carry tokens", () => {
  const leaked = {
    access_token: "IGQWE",
    posts: [{ network: "instagram" as const, position: 1, permalink: "https://ig/p/1", caption: "", takenAt: null, mediaType: "IMAGE" }],
  };
  assert.equal(hasTokenLeak(leaked), true);

  const pub = publicSocialAccount({
    network: "instagram",
    profileUrl: "https://instagram.com/jane",
    handle: "jane",
    connected: true,
    access_token: "nope",
    posts: leaked.posts,
  } as never);
  assert.equal(hasTokenLeak(pub), false);
  assert.equal("access_token" in pub, false);

  const bio = publicApplicantBio({
    photo: null,
    text: "Quiet household.",
    socialConsent: true,
    draftId: "dft_1",
    access_token: "IGQWE",
    social: {
      instagram: {
        network: "instagram",
        profileUrl: "https://instagram.com/jane",
        handle: "jane",
        connected: true,
        refreshToken: "secret",
        posts: pub.posts,
      },
      tiktok: { network: "tiktok", profileUrl: "", handle: "", connected: false, posts: [] },
      facebook: { network: "facebook", profileUrl: "", handle: "", connected: false, posts: [] },
    },
  } as never);
  assert.equal(hasTokenLeak(bio), false);
  assert.equal(bio.social.instagram.handle, "jane");
  assert.deepEqual(Object.keys(pub.posts[0] ?? {}).sort(), [
    "caption",
    "mediaType",
    "network",
    "permalink",
    "position",
    "takenAt",
  ]);
});

test("sanitize writes publicApplicantBio so packet JSON cannot carry tokens", () => {
  const source = readFileSync(new URL("../apply/sanitize.ts", import.meta.url), "utf8");
  assert.match(source, /publicApplicantBio/);
  assert.doesNotMatch(source, /\.\.\.state\.bio/);
});

test("income publicChecks omit blob paths and raw model dumps", () => {
  const source = readFileSync(new URL("../income/view.ts", import.meta.url), "utf8");
  assert.match(source, /never a blob path or raw model dump/);
  assert.doesNotMatch(source, /blobPath:/);
  assert.doesNotMatch(source, /rawJson:/);
});

test("Jane SAMPLE profile has a bio and no invented social tiles", () => {
  const source = readFileSync(new URL("../data/mock-applicants.ts", import.meta.url), "utf8");
  assert.match(source, /sample: true/);
  assert.match(source, /social: \[\]/);
});
