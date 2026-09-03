import assert from "node:assert/strict";
import { test } from "node:test";
import { FEATURED_LISTING_ID, demoProperties, demoPropertyById } from "../data/mock-data.ts";
import { applyAsRenterHref, featuredApplyHref } from "./public-cta.ts";

test("featured listing is 170 Chorus / resh-510", () => {
  assert.equal(FEATURED_LISTING_ID, "resh-510");
  const featured = demoPropertyById(FEATURED_LISTING_ID);
  assert.ok(featured);
  assert.equal(featured.address, "170 Chorus, Irvine, CA 92618");
  assert.equal(featuredApplyHref(), "/apply/resh-510");
});

test("demo catalogue still includes Chorus, Modesto, and Diamond Flats", () => {
  const rows = demoProperties();
  const byStreet = (street: string) => rows.find((row) => row.address.includes(street));

  const chorus = byStreet("170 Chorus");
  const modesto = byStreet("14 Modesto");
  const diamond = byStreet("66 Diamond Flats");

  assert.ok(chorus, "170 Chorus must stay in the demo catalogue");
  assert.equal(chorus.id, "resh-510");
  assert.ok(modesto, "14 Modesto must stay in the demo catalogue");
  assert.ok(diamond, "66 Diamond Flats must stay in the demo catalogue");
});

test("Apply as renter never points at a listing that production does not seed", () => {
  assert.equal(applyAsRenterHref(true), "/apply/resh-510");
  assert.equal(applyAsRenterHref(false), "/apply");
});
