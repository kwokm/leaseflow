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
  for (const source of [hero, pillars]) {
    assert.match(source, /stamp="SAMPLE"/);
    assert.doesNotMatch(source, /demo pull/i);
    assert.doesNotMatch(source, /Mock public-records note/);
  }
  assert.match(screening, /Sample/);
  assert.doesNotMatch(screening, /demo pull/i);
  assert.doesNotMatch(screening, /Mock public-records note/);
});

test("landing packet is a static landlord glance, not a fading loop", () => {
  const hero = readFileSync(new URL("../../components/desk/hero-packet.tsx", import.meta.url), "utf8");
  assert.match(hero, /Monthly gross from AI Income Check/);
  assert.match(hero, /Read from upload/);
  assert.match(hero, /Photo ID/);
  assert.match(hero, /AI Income Check/);
  assert.match(hero, /Background/);
  assert.doesNotMatch(hero, /DemoPlay/);
  assert.doesNotMatch(hero, /p-score/);
  assert.doesNotMatch(hero, /verified/i);
});

test("landing cuts redundant marketing and keeps a real footer", () => {
  const page = readFileSync(new URL("../../app/page.tsx", import.meta.url), "utf8");
  assert.match(page, /HeroPacket/);
  assert.match(page, /SiteFooter/);
  assert.match(page, /Four steps, start to decision/);
  assert.match(page, /Applicants pay \$24\.99; Experian included/);
  assert.doesNotMatch(page, /What we do best/);
  assert.doesNotMatch(page, /PillarExperian|PillarIncome|PillarPacket/);
  assert.doesNotMatch(page, /HeroDesk/);
  assert.doesNotMatch(page, /Applicants pay the fee/);
  assert.doesNotMatch(page, /leaseproof\.app\/packet/);
});
