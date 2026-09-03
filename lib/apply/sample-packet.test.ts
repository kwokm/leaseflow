import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  DEMO_APPLICANT_ID,
  isSampleMarketingPacket,
  packetApplicantId,
} from "./sample-packet.ts";

test("jane-doe and jane resolve to the seeded sample applicant", () => {
  assert.equal(DEMO_APPLICANT_ID, "app-jane");
  assert.equal(isSampleMarketingPacket("jane-doe"), true);
  assert.equal(isSampleMarketingPacket("jane"), true);
  assert.equal(isSampleMarketingPacket("app-jane"), true);
  assert.equal(isSampleMarketingPacket("resh-510"), true);
  assert.equal(packetApplicantId("jane-doe"), "app-jane");
  assert.equal(packetApplicantId("jane"), "app-jane");
});

test("unknown packet ids are not remapped onto Jane Doe", () => {
  assert.equal(isSampleMarketingPacket("random-renter"), false);
  assert.equal(packetApplicantId("random-renter"), "random-renter");
  assert.equal(packetApplicantId("app-1"), "app-1");
});

test("landing illustrations stamp SAMPLE instead of demo pull", () => {
  const hero = readFileSync(new URL("../../components/desk/hero-packet.tsx", import.meta.url), "utf8");
  const pillars = readFileSync(new URL("../../components/demos/pillar-demos.tsx", import.meta.url), "utf8");
  const screening = readFileSync(new URL("../../components/demos/screening.tsx", import.meta.url), "utf8");
  for (const source of [hero, pillars, screening]) {
    assert.match(source, /SAMPLE/);
    assert.doesNotMatch(source, /demo pull/i);
    assert.doesNotMatch(source, /Mock public-records note/);
  }
});
