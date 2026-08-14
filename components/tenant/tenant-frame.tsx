"use client";

import { usePathname } from "next/navigation";
import { PacketWindow } from "@/components/desk/packet-window";
import { TenantSidebar } from "@/components/tenant/tenant-sidebar";
import { FEATURED_LISTING_ID, getPropertyById } from "@/lib/data/mock-data";
import { shortAddress } from "@/lib/desk/display";

function titleFor(pathname: string): string {
  if (pathname.startsWith("/tenant/messages")) return "Messages";
  if (pathname.startsWith("/tenant/payments")) return "Payments";
  const property = getPropertyById(FEATURED_LISTING_ID);
  if (property) return `Your application • ${shortAddress(property.address)}`;
  return "Your application";
}

export function TenantFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <PacketWindow title={titleFor(pathname)} meta="Tenant desk · Jane Doe">
      <div className="desk">
        <TenantSidebar />
        <div className="min-w-0">{children}</div>
      </div>
    </PacketWindow>
  );
}
