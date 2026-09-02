import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ApplyWizard } from "@/components/apply/wizard";
import { ListingUnavailable } from "@/components/apply/listing-unavailable";
import { findProperty } from "@/lib/listings/service";

export const metadata: Metadata = {
  title: "Apply — Leaseproof",
  description: "Rental application and screening.",
};

/**
 * Resolved on the server so a bad listing id 404s before the wizard mounts,
 * rather than flashing an empty packet while the client looks it up. A listing
 * store that cannot be read is a third case, and it is not a 404.
 */
export default async function ApplyPage({
  params,
}: {
  params: Promise<{ listingId: string }>;
}) {
  const { listingId } = await params;
  const lookup = await findProperty(listingId);

  if (lookup.status === "missing") notFound();
  if (lookup.status === "unavailable") return <ListingUnavailable />;

  return (
    <Suspense fallback={null}>
      <ApplyWizard property={lookup.property} />
    </Suspense>
  );
}
