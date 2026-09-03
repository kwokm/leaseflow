import assert from "node:assert/strict";
import { test } from "node:test";
import { deskScreeningChecks } from "./screening-ticks.ts";

test("a Neon applicant with no mock id and no rows is all empty ticks", () => {
  const applicant = {
    id: "app_oc_real_not_in_mock",
    screening: { documentKinds: [] as string[], creditShareStatus: null },
  };
  assert.equal(applicant.id.startsWith("app-"), false);
  assert.deepEqual(deskScreeningChecks(applicant), {
    photoId: false,
    experian: false,
    income: false,
    background: false,
  });
});

test("Neon ticks read documents, shared credit, and ready income — never mock", () => {
  assert.deepEqual(
    deskScreeningChecks({
      screening: {
        documentKinds: ["photo_id_front", "paystub"],
        creditShareStatus: "shared",
      },
      incomeCheck: { status: "ready" },
    }),
    {
      photoId: true,
      experian: true,
      income: true,
      background: false,
    },
  );
});

test("photo ID back is enough; authorized credit is not a filled Experian tick", () => {
  const ticks = deskScreeningChecks({
    screening: {
      documentKinds: ["photo_id_back"],
      creditShareStatus: "authorized",
    },
    incomeCheck: { status: "pending" },
  });
  assert.equal(ticks.photoId, true);
  assert.equal(ticks.experian, false);
  assert.equal(ticks.income, false);
  assert.equal(ticks.background, false);
});

test("requested credit and ready income do not invent a background tick", () => {
  const ticks = deskScreeningChecks({
    screening: { documentKinds: [], creditShareStatus: "requested" },
    incomeCheck: { status: "ready" },
  });
  assert.equal(ticks.experian, false);
  assert.equal(ticks.income, true);
  assert.equal(ticks.background, false);
});
