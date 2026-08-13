import Link from "next/link";
import { notFound } from "next/navigation";
import { ApplicationDesk } from "@/components/desk/application-desk";
import { DeskToolbar } from "@/components/desk/packet-window";
import { Button } from "@/components/ui/button";
import { getPropertyById } from "@/lib/data/mock-data";
import { shortAddress } from "@/lib/desk/display";

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const property = getPropertyById(id);

  if (!property) notFound();

  return (
    <>
      <DeskToolbar
        meta={`${property.bedrooms} bed · $${property.rent.toLocaleString()}/mo`}
      >
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard/listings">All listings</Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href={`/apply/${property.id}`}>Apply link</Link>
        </Button>
        <span className="desk-pill capitalize">{property.screeningPackage}</span>
        <span className="text-[13px] font-medium text-ink">
          {shortAddress(property.address)}
        </span>
      </DeskToolbar>
      <ApplicationDesk propertyId={property.id} chrome={false} />
    </>
  );
}
