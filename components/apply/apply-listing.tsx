"use client";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { ApplyWizard } from "@/components/apply/wizard";
import { getPropertyById, type Property } from "@/lib/data/mock-data";

export function ApplyListing({ listingId }: { listingId: string }) {
  const [property, setProperty] = useState<Property | undefined>(() => getPropertyById(listingId));
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setProperty(getPropertyById(listingId));
    setReady(true);
  }, [listingId]);

  if (ready && !property) notFound();
  if (!property) return null;

  return <ApplyWizard property={property} />;
}
