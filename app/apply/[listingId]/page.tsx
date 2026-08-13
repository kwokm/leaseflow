import type { Metadata } from "next";
import { ApplyWizard } from "@/components/apply/wizard";
import { getPropertyById } from "@/lib/data/mock-data";

// 742 Evergreen Terrace is the demo listing every unknown id falls back to.
const DEFAULT_LISTING_ID = "prop-1";

export const metadata: Metadata = {
  title: "Apply — LeaseFlow",
  description: "Rental application and screening. Demo prototype with mock data.",
};

export default async function ApplyPage({
  params,
}: {
  params: Promise<{ listingId: string }>;
}) {
  const { listingId } = await params;
  const property = getPropertyById(listingId) ?? getPropertyById(DEFAULT_LISTING_ID)!;

  return <ApplyWizard property={property} />;
}
