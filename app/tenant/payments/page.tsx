"use client";

import { useEffect, useState } from "react";
import { DeskToolbar } from "@/components/desk/packet-window";
import { Reveal } from "@/components/motion/reveal";
import { FEATURED_LISTING_ID, STANDARD_SCREENING_FEE, getScreeningFee } from "@/lib/data/mock-data";
import { loadTenantPacket, type TenantPacket } from "@/lib/tenant/session";

export default function TenantPaymentsPage() {
  const [packet, setPacket] = useState<TenantPacket | null>(null);

  useEffect(() => {
    setPacket(loadTenantPacket(FEATURED_LISTING_ID));
  }, []);

  const fee = packet ? getScreeningFee(packet.property.screeningPackage) : STANDARD_SCREENING_FEE;

  return (
    <Reveal>
      <DeskToolbar meta="Preview · mock ledger">
        <span className="desk-pill is-on">Yours</span>
      </DeskToolbar>
      <div className="overflow-x-auto">
        <table className="app-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Status</th>
              <th className="num">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                Standard screening fee
                <div className="text-[12px] text-mute">Collected when you submit the packet</div>
              </td>
              <td>
                <span className={packet?.submitted ? "status status-ok" : "status"}>
                  {packet?.submitted ? "Paid" : "Pending"}
                </span>
              </td>
              <td className="num score">${fee.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </Reveal>
  );
}
