import assert from "node:assert/strict";
import { test } from "node:test";
import type { Applicant } from "../data/mock-data.ts";
import { deskScreeningChecks, screeningChecks } from "./screening.ts";

function neonApplicant(overrides: Partial<Applicant> = {}): Applicant {
  return {
    id: "app_oc_real_not_in_mock",
    propertyId: "lst_huntington",
    status: "completed",
    firstName: "Alex",
    lastName: "Rivera",
    email: "alex.rivera@example.com",
    phone: "(714) 555-0142",
    appliedAt: "2026-09-02T16:00:00Z",
    completedAt: "2026-09-02T16:40:00Z",
    screening: { documentKinds: [], creditShareStatus: null },
    ...overrides,
  };
}

test("a Neon applicant with no mock id and no rows is all empty ticks", () => {
  const applicant = neonApplicant();
  assert.equal(applicant.id.startsWith("app-"), false);
  const ticks = screeningChecks(applicant);
  assert.deepEqual(ticks, {
    photoId: false,
    experian: false,
    income: false,
    background: false,
  });
});

test("Neon ticks read documents, shared credit, and ready income — never mock", () => {
  const applicant = neonApplicant({
    screening: {
      documentKinds: ["photo_id_front", "paystub"],
      creditShareStatus: "shared",
    },
    incomeCheck: {
      status: "ready",
      monthlyGross: 7200,
      monthlyGrossCents: 720_000,
      nameMatch: true,
      recency: "current",
      recencyLabel: "Current",
      employer: "Studio",
      readyCount: 1,
      checkCount: 1,
    },
  });

  assert.deepEqual(screeningChecks(applicant), {
    photoId: true,
    experian: true,
    income: true,
    background: false,
  });
  assert.deepEqual(deskScreeningChecks(applicant), screeningChecks(applicant));
});

test("photo ID back is enough; authorized credit is not a filled Experian tick", () => {
  const applicant = neonApplicant({
    screening: {
      documentKinds: ["photo_id_back"],
      creditShareStatus: "authorized",
    },
    incomeCheck: {
      status: "pending",
      monthlyGross: null,
      monthlyGrossCents: null,
      nameMatch: null,
      recency: null,
      recencyLabel: null,
      employer: null,
      readyCount: 0,
      checkCount: 1,
    },
  });

  const ticks = screeningChecks(applicant);
  assert.equal(ticks.photoId, true);
  assert.equal(ticks.experian, false);
  assert.equal(ticks.income, false);
  assert.equal(ticks.background, false);
});

test("landing preview packets without a screening object still use mock-data", () => {
  const sarah: Applicant = {
    id: "app-1",
    propertyId: "resh-510",
    status: "completed",
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah.johnson@email.com",
    phone: "",
    appliedAt: "2026-07-18T11:00:00Z",
  };
  const ticks = screeningChecks(sarah);
  assert.equal(ticks.photoId, true);
  assert.equal(ticks.experian, true);
  assert.equal(ticks.income, true);
  assert.equal(ticks.background, true);
});

test("requested credit and ready income do not invent a background tick", () => {
  const ticks = screeningChecks(
    neonApplicant({
      screening: { documentKinds: [], creditShareStatus: "requested" },
      incomeCheck: {
        status: "ready",
        monthlyGross: 5000,
        monthlyGrossCents: 500_000,
        nameMatch: true,
        recency: "current",
        recencyLabel: "Current",
        employer: null,
        readyCount: 1,
        checkCount: 1,
      },
    }),
  );
  assert.equal(ticks.experian, false);
  assert.equal(ticks.income, true);
  assert.equal(ticks.background, false);
});
