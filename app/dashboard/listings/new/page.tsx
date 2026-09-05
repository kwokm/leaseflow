import { NewListingForm, type ListingEntryMode } from "@/components/listings/new-listing-form";

export default async function NewListingPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const { mode } = await searchParams;
  const initialMode: ListingEntryMode =
    mode === "import" ? "import" : mode === "choose" ? "choose" : "manual";

  return <NewListingForm initialMode={initialMode} />;
}
