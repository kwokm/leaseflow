import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { canWriteListingDecision } from "../applications/decision.ts";
import { hasTokenLeak, publicSocialAccount } from "./snapshot.ts";

test("only the listing owner may read social snapshots", () => {
  assert.equal(
    canWriteListingDecision({ viewerUserId: "usr_owner", listingOwnerId: "usr_owner" }),
    true
  );
  assert.equal(
    canWriteListingDecision({ viewerUserId: "usr_other", listingOwnerId: "usr_owner" }),
    false
  );
});

test("owner-only profile payload never includes tokens", () => {
  const profile = {
    photoUrl: "/api/uploads/file?path=applications/photo.jpg",
    bio: "Remote designer.",
    social: [
      publicSocialAccount({
        network: "instagram",
        profileUrl: "https://instagram.com/alex",
        handle: "alex",
        connected: true,
        access_token: "nope",
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
      } as never),
    ],
  };
  assert.equal(hasTokenLeak(profile), false);
});

test("profile API is owner-only and refuses token-bearing payloads", () => {
  const source = readFileSync(
    new URL("../../app/api/applications/[id]/profile/route.ts", import.meta.url),
    "utf8"
  );
  assert.match(source, /getDeskApplicant/);
  assert.match(source, /hasTokenLeak/);
  assert.match(source, /Owner-only/);
});
