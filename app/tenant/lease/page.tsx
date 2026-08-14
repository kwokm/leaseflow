"use client";

import Link from "next/link";
import { LeasePacket } from "@/components/leasing/lease-packet";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { TENANT_APPLICANT_ID } from "@/lib/tenant/session";
import { useLeaseByApplication, useLeases } from "@/lib/leasing/store";
import { FEATURED_LISTING_ID } from "@/lib/data/mock-data";

export default function TenantLeasePage() {
  const byJane = useLeaseByApplication(TENANT_APPLICANT_ID);
  const leases = useLeases();
  const lease =
    byJane ?? leases.find((row) => row.listingId === FEATURED_LISTING_ID);

  if (!lease) {
    return (
      <Reveal className="px-6 py-12">
        <p className="text-[15px] font-medium text-ink">No lease to sign yet</p>
        <p className="mt-1 text-[13px] font-medium text-mute">
          When the realtor approves your packet, the lease lands here for dummy e-sign.
        </p>
        <Button asChild className="mt-4">
          <Link href="/tenant">Back to application</Link>
        </Button>
      </Reveal>
    );
  }

  return (
    <LeasePacket lease={lease} backHref="/tenant" backLabel="Back to application" />
  );
}
