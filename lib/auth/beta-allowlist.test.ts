import assert from "node:assert/strict";
import { test } from "node:test";
import {
  DEFAULT_DEMO_LANDLORD_EMAILS,
  isLandlordEmailAllowed,
  landlordBetaEmails,
  parseBetaEmails,
  defaultBetaEmailsOn,
} from "./beta-allowlist.ts";

test("production with an unset allowlist admits nobody", () => {
  assert.deepEqual(parseBetaEmails(undefined, false), []);
  assert.deepEqual(parseBetaEmails("", false), []);
  assert.deepEqual(parseBetaEmails("   ", false), []);
  assert.equal(isLandlordEmailAllowed("michaelgkwok@gmail.com", []), false);
  assert.equal(isLandlordEmailAllowed("aaisuzukillc@gmail.com", []), false);
});

test("demo with an unset allowlist includes only the two known OC emails", () => {
  const emails = parseBetaEmails(undefined, true);
  assert.deepEqual(emails, [...DEFAULT_DEMO_LANDLORD_EMAILS]);
  assert.equal(isLandlordEmailAllowed("michaelgkwok@gmail.com", emails), true);
  assert.equal(isLandlordEmailAllowed("AAISUZUKILLC@gmail.com", emails), true);
  assert.equal(isLandlordEmailAllowed("stranger@example.com", emails), false);
});

test("an explicit list always wins and is case-insensitive", () => {
  const emails = parseBetaEmails("  Alex@OC.example ,jamie@oc.example ", false);
  assert.deepEqual(emails, ["alex@oc.example", "jamie@oc.example"]);
  assert.equal(isLandlordEmailAllowed("ALEX@oc.example", emails), true);
  assert.equal(isLandlordEmailAllowed("michaelgkwok@gmail.com", emails), false);
});

test("demo does not invent other landlord names when the env is set", () => {
  const emails = parseBetaEmails("only@oc.example", true);
  assert.deepEqual(emails, ["only@oc.example"]);
  assert.equal(emails.includes("chorus"), false);
});

test("Vercel Preview defaults to the two known OC emails when the env is unset", () => {
  assert.equal(defaultBetaEmailsOn({ VERCEL_ENV: "preview" } as NodeJS.ProcessEnv), true);
  assert.deepEqual(
    landlordBetaEmails({ VERCEL_ENV: "preview" } as NodeJS.ProcessEnv),
    [...DEFAULT_DEMO_LANDLORD_EMAILS]
  );
  assert.equal(
    isLandlordEmailAllowed(
      "michaelgkwok@gmail.com",
      landlordBetaEmails({ VERCEL_ENV: "preview" } as NodeJS.ProcessEnv)
    ),
    true
  );
});

test("production Vercel still admits nobody when the allowlist is empty", () => {
  assert.equal(defaultBetaEmailsOn({ VERCEL_ENV: "production" } as NodeJS.ProcessEnv), false);
  assert.deepEqual(
    landlordBetaEmails({ VERCEL_ENV: "production" } as NodeJS.ProcessEnv),
    []
  );
  assert.deepEqual(
    landlordBetaEmails({
      VERCEL_ENV: "production",
      LEASEPROOF_BETA_EMAILS: "",
    } as NodeJS.ProcessEnv),
    []
  );
});

test("an explicit preview list still wins over the known OC emails", () => {
  assert.deepEqual(
    landlordBetaEmails({
      VERCEL_ENV: "preview",
      LEASEPROOF_BETA_EMAILS: "only@oc.example",
    } as NodeJS.ProcessEnv),
    ["only@oc.example"]
  );
});

test("landlordBetaEmails reads LEASEPROOF_BETA_EMAILS and LEASEPROOF_DEMO", () => {
  assert.deepEqual(
    landlordBetaEmails({} as NodeJS.ProcessEnv),
    []
  );
  assert.deepEqual(
    landlordBetaEmails({ LEASEPROOF_DEMO: "1" } as NodeJS.ProcessEnv),
    [...DEFAULT_DEMO_LANDLORD_EMAILS]
  );
  assert.deepEqual(
    landlordBetaEmails({
      LEASEPROOF_DEMO: "1",
      LEASEPROOF_BETA_EMAILS: "new@oc.example",
    } as NodeJS.ProcessEnv),
    ["new@oc.example"]
  );
});

test("blank emails never match", () => {
  assert.equal(isLandlordEmailAllowed("", ["a@b.com"]), false);
  assert.equal(isLandlordEmailAllowed("   ", ["a@b.com"]), false);
});
