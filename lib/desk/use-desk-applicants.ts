"use client";

import { useCallback, useEffect, useState } from "react";
import type { Applicant } from "@/lib/data/mock-data";
import { sortDeskFirst } from "@/lib/desk/display";

/**
 * The desk queue comes from Neon, including the stored approve/decline
 * decision. localStorage is no longer the source of truth.
 */
function useApplicants(query: string): {
  applicants: Applicant[];
  ready: boolean;
  refresh: () => Promise<void>;
} {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [ready, setReady] = useState(false);

  const load = useCallback(async () => {
    try {
      const response = await fetch(`/api/applications${query}`);
      const payload = (response.ok ? await response.json() : { applicants: [] }) as {
        applicants?: Applicant[];
      };
      setApplicants(sortDeskFirst(payload.applicants ?? []));
    } catch {
      setApplicants([]);
    } finally {
      setReady(true);
    }
  }, [query]);

  useEffect(() => {
    let active = true;
    fetch(`/api/applications${query}`)
      .then((response) => (response.ok ? response.json() : { applicants: [] }))
      .then((payload: { applicants?: Applicant[] }) => {
        if (!active) return;
        setApplicants(sortDeskFirst(payload.applicants ?? []));
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

  return { applicants, ready, refresh: load };
}

export function useDeskApplicants(): {
  applicants: Applicant[];
  ready: boolean;
  refresh: () => Promise<void>;
} {
  return useApplicants("");
}

export function useDeskApplicantsForListing(listingId: string): {
  applicants: Applicant[];
  ready: boolean;
  refresh: () => Promise<void>;
} {
  return useApplicants(`?listingId=${encodeURIComponent(listingId)}`);
}

export function useDeskApplicant(id: string): {
  applicant: Applicant | undefined;
  ready: boolean;
  refresh: () => Promise<void>;
} {
  const [applicant, setApplicant] = useState<Applicant | undefined>(undefined);
  const [ready, setReady] = useState(false);

  const load = useCallback(async () => {
    try {
      const response = await fetch(`/api/applications/${encodeURIComponent(id)}/decision`);
      if (!response.ok) {
        setApplicant(undefined);
        return;
      }
      const payload = (await response.json()) as { applicant?: Applicant };
      setApplicant(payload.applicant);
    } catch {
      setApplicant(undefined);
    } finally {
      setReady(true);
    }
  }, [id]);

  useEffect(() => {
    let active = true;
    setReady(false);

    fetch(`/api/applications/${encodeURIComponent(id)}/decision`)
      .then((response) => (response.ok ? response.json() : { applicant: undefined }))
      .then((payload: { applicant?: Applicant }) => {
        if (!active) return;
        setApplicant(payload.applicant);
      })
      .catch(() => {
        if (active) setApplicant(undefined);
      })
      .finally(() => {
        if (active) setReady(true);
      });

    return () => {
      active = false;
    };
  }, [id]);

  return { applicant, ready, refresh: load };
}
