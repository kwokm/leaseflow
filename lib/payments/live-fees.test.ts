import assert from "node:assert/strict";
import { test } from "node:test";
import {
  liveChargesAllowed,
  liveFeesFlagOn,
  stripeKeyIsLive,
} from "./live-fees.ts";

test("test-mode keys can create Checkout without the live-fees flag", () => {
  assert.equal(stripeKeyIsLive("sk_test_abc"), false);
  assert.equal(
    liveChargesAllowed({ stripeSecretKey: "sk_test_abc", liveFees: undefined }),
    true
  );
});

test("a missing Stripe key is not treated as a live charge path", () => {
  assert.equal(stripeKeyIsLive(undefined), false);
  assert.equal(liveChargesAllowed({}), true);
});

test("a live key cannot charge unless LEASEPROOF_LIVE_FEES is on", () => {
  assert.equal(stripeKeyIsLive("sk_live_abc"), true);
  assert.equal(
    liveChargesAllowed({ stripeSecretKey: "sk_live_abc", liveFees: undefined }),
    false
  );
  assert.equal(
    liveChargesAllowed({ stripeSecretKey: "sk_live_abc", liveFees: "0" }),
    false
  );
  assert.equal(
    liveChargesAllowed({ stripeSecretKey: "sk_live_abc", liveFees: "1" }),
    true
  );
  assert.equal(
    liveChargesAllowed({ stripeSecretKey: "sk_live_abc", liveFees: "true" }),
    true
  );
});

test("the live-fees flag defaults off", () => {
  assert.equal(liveFeesFlagOn(undefined), false);
  assert.equal(liveFeesFlagOn(""), false);
  assert.equal(liveFeesFlagOn("1"), true);
});
