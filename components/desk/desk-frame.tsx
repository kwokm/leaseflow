"use client";

import { usePathname } from "next/navigation";
import { DeskSidebar } from "@/components/desk/desk-sidebar";
import { PacketWindow } from "@/components/desk/packet-window";
import { getApplicantById, getPropertyById } from "@/lib/data/mock-data";
import { shortAddress } from "@/lib/desk/display";

function titleFor(pathname: string): string {
  const packet = pathname.match(/^\/dashboard\/applications\/([^/]+)/);
  if (packet) {
    const applicant = getApplicantById(packet[1]);
    const property = applicant ? getPropertyById(applicant.propertyId) : undefined;
    if (applicant && property) {
      return `Application packet • ${applicant.firstName} ${applicant.lastName}`;
    }
    return "Application packet";
  }

  const listing = pathname.match(/^\/dashboard\/listings\/([^/]+)/);
  if (listing && listing[1] !== "new") {
    const property = getPropertyById(listing[1]);
    if (property) return `Application packet • ${shortAddress(property.address)}`;
    return "Application packet";
  }

  if (pathname.startsWith("/dashboard/listings")) return "Properties";
  if (pathname.startsWith("/dashboard/payments")) return "Payments";
  if (pathname.startsWith("/dashboard/messages")) return "Messages";
  return "Application packet • 742 Evergreen Terrace";
}

export function DeskFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <PacketWindow title={titleFor(pathname)} className="min-h-[640px]">
      <div className="grid min-h-[600px] grid-cols-1 bg-paper sm:grid-cols-[196px_minmax(0,1fr)]">
        <DeskSidebar />
        <div className="min-w-0">{children}</div>
      </div>
    </PacketWindow>
  );
}
