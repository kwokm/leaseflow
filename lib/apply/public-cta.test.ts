import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { applyAsRenterHref, FEATURED_APPLY_LISTING_ID, featuredApplyHref } from "./public-cta.ts";

const MOCK_DATA = readFileSync(new URL("../data/mock-data.ts", import.meta.url), "utf8");

test("featured listing is 170 Chorus / resh-510", () => {
  assert.equal(FEATURED_APPLY_LISTING_ID, "resh-510");
  assert.equal(featuredApplyHref(), "/apply/resh-510");
  assert.match(MOCK_DATA, /export const FEATURED_LISTING_ID = "resh-510"/);
  assert.match(MOCK_DATA, /id: "resh-510"/);
  assert.match(MOCK_DATA, /170 Chorus, Irvine, CA 92618/);
});

test("demo catalogue still includes Chorus, Modesto, and Diamond Flats", () => {
  assert.match(MOCK_DATA, /170 Chorus, Irvine, CA 92618/);
  assert.match(MOCK_DATA, /14 Modesto, Irvine, CA 92602/);
  assert.match(MOCK_DATA, /66 Diamond Flats, Irvine, CA 92602/);
});

test("Apply as renter never points at a listing that production does not seed", () => {
  assert.equal(applyAsRenterHref(true), "/apply/resh-510");
  assert.equal(applyAsRenterHref(false), "/apply");
});
