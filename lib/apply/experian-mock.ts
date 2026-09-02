import type { ExperianState } from "./types";

/*
 * Everything in this file is fabricated in the browser. Leaseproof never
 * calls a consumer reporting agency, never collects bureau credentials, and the
 * "authorization" screen is demo chrome only.
 */

function seedFrom(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/** Deterministic score in the low 700s so the demo reads the same every time. */
export function mockExperianScore(seed: string): number {
  if (!seed) return 720;
  return 706 + (seedFrom(seed) % 29); // 706–734, centred near 720
}

export function buildMockExperianPull(seed: string, pulledAt: string): ExperianState {
  const score = mockExperianScore(seed);
  const hash = seedFrom(seed || "leaseflow");

  return {
    status: "connected",
    score,
    scoreModel: "VantageScore 3.0 (demo)",
    pulledAt,
    onTimePaymentRate: 92 + (hash % 7),
    openAccounts: 6 + (hash % 6),
    oldestAccountYears: 5 + (hash % 8),
    recentInquiries: hash % 3,
    publicRecords: 0,
    factors: [
      "No missed payments reported in the last 24 months",
      "Revolving utilization in the low 30% range",
      "Credit history length is close to the national average",
    ],
  };
}

export function scoreBand(score: number): { label: string; tone: "ok" | "mid" | "low" } {
  if (score >= 750) return { label: "Excellent", tone: "ok" };
  if (score >= 670) return { label: "Good", tone: "mid" };
  if (score >= 580) return { label: "Fair", tone: "mid" };
  return { label: "Needs work", tone: "low" };
}
