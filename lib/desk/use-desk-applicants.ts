"use client";

import { useEffect, useState } from "react";
import type { Applicant } from "@/lib/data/mock-data";
import { loadDecisions, withDecision } from "@/lib/desk/decisions";
import { sortDeskFirst } from "@/lib/desk/display";

/**
 * The desk queue comes from Neon. Approve/decline is still a local decision
 * overlay, so those are re-applied on top of what the server returns.
 */
function decorate(rows: Applicant[]): Applicant[] {
  const decisions = loadDecisions();
  return sortDeskFirst(rows.map((row) => withDecision(row, decisions)));
}

function useApplicants(query: string): { applicants: Applicant[]; ready: boolean } {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;

    fetch(`/api/applications${query}`)
      .then((response) => (response.ok ? response.json() : { applicants: [] }))
      .then((payload: { applicants?: Applicant[] }) => {
        if (!active) return;
        setApplicants(decorate(payload.applicants ?? []));
      })
      .catch(() => {
        if (active) setApplicants([]);
      })
      .finally(() => {
        if (active) setReady(true);
      });

    return () => {
      active = false;
    };
  }, [query]);

  return { applicants, ready };
}

export function useDeskApplicants(): { applicants: Applicant[]; ready: boolean } {
  return useApplicants("");
}

export function useDeskApplicantsForListing(listingId: string): {
  applicants: Applicant[];
  ready: boolean;
} {
  return useApplicants(`?listingId=${encodeURIComponent(listingId)}`);
}
