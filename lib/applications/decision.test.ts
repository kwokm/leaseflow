import assert from "node:assert/strict";
import { test } from "node:test";
import type { Applicant } from "../data/mock-data.ts";
import {
  applyDecisionToApplicant,
  canWriteListingDecision,
  deskStatusFrom,
  isLandlordDecision,
} from "./decision.ts";

test("decision columns win over screening status so a reload shows Approve", () => {
  assert.equal(deskStatusFrom({ status: "completed", decision: "approved" }), "approved");
  assert.equal(deskStatusFrom({ status: "completed", decision: "declined" }), "declined");
  assert.equal(deskStatusFrom({ status: "paid", decision: null }), "in_progress");
  assert.equal(deskStatusFrom({ status: "screening", decision: undefined }), "in_progress");
  assert.equal(deskStatusFrom({ status: "completed", decision: null }), "completed");
});

test("legacy status approved/declined still maps if decision was never written", () => {
  assert.equal(deskStatusFrom({ status: "approved", decision: null }), "approved");
  assert.equal(deskStatusFrom({ status: "declined" }), "declined");
});

test("only the listing owner may write a decision", () => {
  assert.equal(
    canWriteListingDecision({ viewerUserId: "usr_owner", listingOwnerId: "usr_owner" }),
    true,
  );
  assert.equal(
    canWriteListingDecision({ viewerUserId: "usr_other", listingOwnerId: "usr_owner" }),
    false,
  );
  assert.equal(
    canWriteListingDecision({ viewerUserId: null, listingOwnerId: "usr_owner" }),
    false,
  );
  assert.equal(
    canWriteListingDecision({ viewerUserId: "usr_owner", listingOwnerId: null }),
    false,
  );
});

test("isLandlordDecision rejects anything that is not approved or declined", () => {
  assert.equal(isLandlordDecision("approved"), true);
  assert.equal(isLandlordDecision("declined"), true);
  assert.equal(isLandlordDecision("completed"), false);
  assert.equal(isLandlordDecision("paid"), false);
  assert.equal(isLandlordDecision(null), false);
});

test("applying a decision is what a reload of the Applicant DTO returns", () => {
  const before: Applicant = {
    id: "app_oc_real_not_in_mock",
    propertyId: "lst_huntington",
    status: "completed",
    firstName: "Alex",
    lastName: "Rivera",
    email: "alex.rivera@example.com",
    phone: "",
    appliedAt: "2026-09-02T16:00:00Z",
    decision: null,
    screening: { documentKinds: ["photo_id_front"], creditShareStatus: "shared" },
  };

  const after = applyDecisionToApplicant(before, "approved", "2026-09-03T18:00:00Z");
  assert.equal(after.status, "approved");
  assert.equal(after.decision, "approved");
  assert.equal(after.decidedAt, "2026-09-03T18:00:00Z");
  assert.equal(deskStatusFrom({ status: "completed", decision: after.decision }), "approved");
});
