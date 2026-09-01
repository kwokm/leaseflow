"use client";

import { useEffect, useState } from "react";
import { FEATURED_LISTING_ID, getAllProperties, getPropertyById, type Property } from "@/lib/data/mock-data";

export function useProperty(id: string, fallback = false) {
  const [property, setProperty] = useState<Property | undefined>(() =>
    typeof window === "undefined" ? getPropertyById(id) : getPropertyById(id),
  );
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const found = getPropertyById(id) ?? (fallback ? getPropertyById(FEATURED_LISTING_ID) : undefined);
    setProperty(found);
    setReady(true);
  }, [id, fallback]);

  return { property, ready };
}

export function useProperties() {
  const [properties, setProperties] = useState<Property[]>(mockSafe());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setProperties(getAllProperties());
    setReady(true);
  }, []);

  return { properties, ready };
}

function mockSafe(): Property[] {
  return getAllProperties();
}
