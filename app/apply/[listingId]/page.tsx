import type { Metadata } from "next";
import { ApplyListing } from "@/components/apply/apply-listing";

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
  return <ApplyListing listingId={listingId} />;
}
