"use client";

import { useEffect, useState } from "react";
import type { Property } from "@/lib/data/mock-data";

/**
 * Listings are read over the API so the demo-seed decision is made once, on the
 * server, from LEASEPROOF_DEMO. Nothing reads localStorage any more.
 */
export function useProperties(): { properties: Property[]; ready: boolean } {
  const [properties, setProperties] = useState<Property[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;

    fetch("/api/listings")
      .then((response) => (response.ok ? response.json() : { listings: [] }))
      .then((payload: { listings?: Property[] }) => {
        if (!active) return;
        setProperties(payload.listings ?? []);
      })
      .catch(() => {
        if (active) setProperties([]);
      })
      .finally(() => {
        if (active) setReady(true);
      });

    return () => {
      active = false;
    };
  }, []);

  return { properties, ready };
}

export function useProperty(id: string): { property: Property | undefined; ready: boolean } {
  const [property, setProperty] = useState<Property | undefined>(undefined);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    setReady(false);

    fetch(`/api/listings/${encodeURIComponent(id)}`)
      .then((response) => (response.ok ? response.json() : { listing: undefined }))
      .then((payload: { listing?: Property }) => {
        if (!active) return;
        setProperty(payload.listing);
      })
      .catch(() => {
        if (active) setProperty(undefined);
      })
      .finally(() => {
        if (active) setReady(true);
      });

    return () => {
      active = false;
    };
  }, [id]);

  return { property, ready };
}
