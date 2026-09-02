import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ApplyWizard } from "@/components/apply/wizard";
import { getProperty } from "@/lib/listings/service";

export const metadata: Metadata = {
  title: "Apply — Leaseproof",
  description: "Rental application and screening.",
};

/**
 * Resolved on the server so a bad listing id 404s before the wizard mounts,
 * rather than flashing an empty packet while the client looks it up.
 */
export default async function ApplyPage({
  params,
}: {
  params: Promise<{ listingId: string }>;
}) {
  const { listingId } = await params;
  const property = await getProperty(listingId);
  if (!property) notFound();

  return (
    <Suspense fallback={null}>
      <ApplyWizard property={property} />
    </Suspense>
  );
}
