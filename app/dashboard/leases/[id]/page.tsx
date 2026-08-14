"use client";

import { use } from "react";
import Link from "next/link";
import { LeasePacket } from "@/components/leasing/lease-packet";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { useLease } from "@/lib/leasing/store";

export default function RealtorLeasePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const lease = useLease(id);

  if (!lease) {
    return (
      <Reveal className="px-6 py-12 text-center">
        <p className="text-[15px] font-medium text-ink">Lease not found</p>
        <p className="mt-1 text-[13px] text-mute">
          Approve a packet to generate a lease. Prototype leases live in this browser.
        </p>
        <Button asChild className="mt-4">
          <Link href="/dashboard/applications">Open applications</Link>
        </Button>
      </Reveal>
    );
  }

  return (
    <LeasePacket
      lease={lease}
      backHref={`/dashboard/applications/${lease.applicationId}`}
      backLabel="Back to packet"
    />
  );
}
