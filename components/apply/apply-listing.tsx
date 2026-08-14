"use client";

import { useEffect, useState } from "react";
import { ApplyWizard } from "@/components/apply/wizard";
import { FEATURED_LISTING_ID, getPropertyById, type Property } from "@/lib/data/mock-data";

export function ApplyListing({ listingId }: { listingId: string }) {
  const [property, setProperty] = useState<Property>(
    () => getPropertyById(listingId) ?? getPropertyById(FEATURED_LISTING_ID)!,
  );

  useEffect(() => {
    setProperty(getPropertyById(listingId) ?? getPropertyById(FEATURED_LISTING_ID)!);
  }, [listingId]);

  return <ApplyWizard property={property} />;
}
