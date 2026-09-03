import assert from "node:assert/strict";
import { test } from "node:test";
import { mergeDemoCatalogue } from "./demo-seed.ts";

const SEEDED = [
  { id: "resh-510", address: "170 Chorus, Irvine, CA 92618" },
  { id: "modesto-14", address: "14 Modesto, Irvine, CA 92602" },
  { id: "diamond-66", address: "66 Diamond Flats, Irvine, CA 92602" },
];

const OWN = { id: "lst_real", address: "200 Pacific, Huntington Beach, CA 92648" };

test("production first-run is empty — no Chorus, Modesto, or Diamond Flats", () => {
  const rows = mergeDemoCatalogue([], SEEDED, false);
  assert.deepEqual(rows, []);
  for (const seed of SEEDED) {
    assert.equal(
      rows.some((row) => row.address.includes(seed.address.split(",")[0])),
      false,
      `must not seed ${seed.address}`
    );
  }
});

test("production keeps only the landlord's own listings", () => {
  const rows = mergeDemoCatalogue([OWN], SEEDED, false);
  assert.deepEqual(rows, [OWN]);
  assert.equal(rows.some((row) => row.address.includes("Chorus")), false);
  assert.equal(rows.some((row) => row.address.includes("Modesto")), false);
  assert.equal(rows.some((row) => row.address.includes("Diamond Flats")), false);
});

test("demo mode still merges the Irvine catalogue", () => {
  const rows = mergeDemoCatalogue([], SEEDED, true);
  assert.deepEqual(rows, SEEDED);
});

test("demo mode does not duplicate a listing the landlord already owns", () => {
  const rows = mergeDemoCatalogue([SEEDED[0]], SEEDED, true);
  assert.equal(rows.filter((row) => row.id === "resh-510").length, 1);
  assert.equal(rows.length, SEEDED.length);
});
