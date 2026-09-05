import assert from "node:assert/strict";
import { test } from "node:test";
import {
  deskSignInHref,
  deskSignUpHref,
  LANDLORD_SIGN_IN_HREF,
  LANDLORD_SIGN_UP_HREF,
  safeDeskNext,
} from "./roles.ts";

test("desk sign-in stays on the in-app /signin page", () => {
  assert.equal(deskSignInHref(), LANDLORD_SIGN_IN_HREF);
  assert.equal(deskSignInHref("/dashboard"), "/signin?next=%2Fdashboard");
  assert.equal(deskSignInHref("/dashboard/listings/new"), "/signin?next=%2Fdashboard%2Flistings%2Fnew");
  assert.ok(!deskSignInHref("/dashboard").includes("accounts.dev"));
});

test("desk sign-up stays on the in-app /signup page", () => {
  assert.equal(deskSignUpHref(), LANDLORD_SIGN_UP_HREF);
  assert.equal(deskSignUpHref("/dashboard"), "/signup?next=%2Fdashboard");
  assert.equal(deskSignUpHref("/dashboard/listings/new"), "/signup?next=%2Fdashboard%2Flistings%2Fnew");
});

test("safeDeskNext rejects open redirects", () => {
  assert.equal(safeDeskNext("https://evil.example"), "/dashboard");
  assert.equal(safeDeskNext("//accounts.dev/sign-in"), "/dashboard");
  assert.equal(safeDeskNext("/signin"), "/dashboard");
});
