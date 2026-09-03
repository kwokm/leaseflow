import assert from "node:assert/strict";
import { test } from "node:test";
import {
  monthlyGrossFromFrequency,
  namesMatch,
  parseModelOutput,
  recencyFromPeriod,
} from "./extract.ts";

test("monthly gross from weekly / biweekly / semimonthly / monthly", () => {
  assert.equal(monthlyGrossFromFrequency(100_000, "weekly"), Math.round((100_000 * 52) / 12));
  assert.equal(monthlyGrossFromFrequency(240_000, "biweekly"), Math.round((240_000 * 26) / 12));
  assert.equal(monthlyGrossFromFrequency(475_000, "semimonthly"), 950_000);
  assert.equal(monthlyGrossFromFrequency(380_000, "monthly"), 380_000);
});

test("unknown frequency does not invent a monthly gross", () => {
  assert.equal(monthlyGrossFromFrequency(240_000, "unknown"), null);
  assert.equal(monthlyGrossFromFrequency(null, "biweekly"), null);
  assert.equal(monthlyGrossFromFrequency(null, "unknown", 850_000), 850_000);
});

test("recency uses the clock that is passed in, not a hardcoded mid-2026 day", () => {
  const today = new Date("2026-09-03T12:00:00.000Z");
  const current = recencyFromPeriod(
    { kind: "paystub", periodStart: "2026-08-01", periodEnd: "2026-08-15" },
    today,
  );
  assert.equal(current.recency, "current");

  const stale = recencyFromPeriod(
    { kind: "paystub", periodStart: "2026-01-01", periodEnd: "2026-01-31" },
    today,
  );
  assert.equal(stale.recency, "stale");

  const unknown = recencyFromPeriod({ kind: "bank_statement" }, today);
  assert.equal(unknown.recency, "unknown");

  const laterToday = new Date("2027-03-10T12:00:00.000Z");
  const fromLater = recencyFromPeriod(
    { kind: "paystub", periodStart: "2026-08-01", periodEnd: "2026-08-15" },
    laterToday,
  );
  // A period that was current in Sept 2026 is stale a year later.
  assert.equal(fromLater.recency, "stale");
});

test("name match is normalized and does not invent a name", () => {
  assert.equal(namesMatch("Jane Doe", "Jane Doe"), true);
  assert.equal(namesMatch("jane  doe", "Jane Doe"), true);
  assert.equal(namesMatch("Jane Marie Doe", "Jane Doe"), true);
  assert.equal(namesMatch("Alex Chen", "Jane Doe"), false);
  assert.equal(namesMatch(null, "Jane Doe"), false);
  assert.equal(namesMatch("Jane Doe", ""), false);
});

test("malformed model JSON becomes an error status, never invented fields", () => {
  const empty = parseModelOutput("");
  assert.equal(empty.ok, false);
  if (!empty.ok) assert.equal(empty.error, "malformed model output");

  const prose = parseModelOutput("I cannot read this paystub.");
  assert.equal(prose.ok, false);

  const truncated = parseModelOutput('{"detected_name": "Jane');
  assert.equal(truncated.ok, false);

  const array = parseModelOutput("[]");
  assert.equal(array.ok, false);
});

test("fenced model JSON is accepted and missing amounts stay null", () => {
  const parsed = parseModelOutput(`\`\`\`json
{
  "detected_name": "Jane Doe",
  "employer": "Leaseproof Demo Co",
  "pay_frequency": "semimonthly",
  "period_start": "2026-08-01",
  "period_end": "2026-08-15",
  "gross_this_period_cents": 425000,
  "ytd_gross_cents": null,
  "monthly_gross_cents": null,
  "recency_current": true,
  "notes": null
}
\`\`\``);
  assert.equal(parsed.ok, true);
  if (!parsed.ok) return;
  assert.equal(parsed.value.detectedName, "Jane Doe");
  assert.equal(parsed.value.employer, "Leaseproof Demo Co");
  assert.equal(parsed.value.payFrequency, "semimonthly");
  assert.equal(parsed.value.monthlyGrossCents, 850_000);
  assert.equal(parsed.value.ytdGrossCents, null);
});
