"use client";

import Link from "next/link";
import { DeskToolbar } from "@/components/desk/packet-window";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import {
  leaseStatusLabel,
  signLease,
  type GeneratedLease,
} from "@/lib/leasing/store";

export function LeasePacket({
  lease,
  backHref,
  backLabel,
}: {
  lease: GeneratedLease;
  backHref: string;
  backLabel: string;
}) {
  const pending = lease.status === "pending_sign" || lease.status === "draft";

  return (
    <Reveal>
      <DeskToolbar meta={leaseStatusLabel(lease.status)}>
        <span className="desk-pill is-on">{leaseStatusLabel(lease.status)}</span>
        <Button asChild variant="outline" size="sm">
          <Link href={backHref}>{backLabel}</Link>
        </Button>
      </DeskToolbar>

      <div className="space-y-5 px-5 py-5 sm:px-6">
        <div>
          <p className="text-[18px] font-semibold tracking-[-0.3px] text-ink">
            Residential lease · {lease.address.split(",")[0]}
          </p>
          <p className="mt-1 text-[13px] font-medium text-mute">
            Generated after approve. Dummy e-sign — no wet ink, no live ACH.
          </p>
        </div>

        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
          <div>
            <dt className="text-[12px] font-medium text-mute-2">Tenant</dt>
            <dd className="mt-0.5 text-[13px] font-medium text-ink">{lease.tenantName}</dd>
          </div>
          <div>
            <dt className="text-[12px] font-medium text-mute-2">Start</dt>
            <dd className="mt-0.5 text-[13px] font-medium text-ink">{lease.startDate}</dd>
          </div>
          <div>
            <dt className="text-[12px] font-medium text-mute-2">Rent</dt>
            <dd className="mt-0.5 text-[13px] font-medium text-ink">
              ${lease.rent.toLocaleString()}/mo
            </dd>
          </div>
          <div>
            <dt className="text-[12px] font-medium text-mute-2">Deposit</dt>
            <dd className="mt-0.5 text-[13px] font-medium text-ink">
              ${lease.deposit.toLocaleString()} ACH
            </dd>
          </div>
          <div>
            <dt className="text-[12px] font-medium text-mute-2">Term</dt>
            <dd className="mt-0.5 text-[13px] font-medium text-ink">12 months</dd>
          </div>
          <div>
            <dt className="text-[12px] font-medium text-mute-2">Status</dt>
            <dd className="mt-0.5 text-[13px] font-medium text-ink">
              {leaseStatusLabel(lease.status)}
            </dd>
          </div>
        </dl>

        <section className="rounded-md border border-line bg-mist/40 p-4">
          <p className="text-[12px] font-medium uppercase tracking-[0.06em] text-mute-2">
            Terms (demo)
          </p>
          <p className="mt-2 text-[13px] font-medium leading-5 text-ink">
            Tenant occupies {lease.address} beginning {lease.startDate} at $
            {lease.rent.toLocaleString()} per month. Security deposit equals one month’s rent and
            queues to ACH after both parties sign. Pets, utilities, and house rules stay on the
            packet the realtor already approved.
          </p>
        </section>

        {pending ? (
          <Button size="sm" onClick={() => signLease(lease.id)}>
            Sign lease
          </Button>
        ) : (
          <p className="text-[13px] font-medium text-ok">
            Signed{lease.signedAt ? ` ${new Date(lease.signedAt).toLocaleString()}` : ""}. Deposit
            queued to ACH — demo only, no bank was contacted.
          </p>
        )}
      </div>
    </Reveal>
  );
}
