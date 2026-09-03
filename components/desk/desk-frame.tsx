"use client";

import { usePathname } from "next/navigation";
import { useRuntimeConfig } from "@/components/config/runtime-config";
import { DeskSidebar } from "@/components/desk/desk-sidebar";
import { PacketWindow } from "@/components/desk/packet-window";

function titleFor(pathname: string): string {
  if (/^\/dashboard\/applications\/[^/]+/.test(pathname)) return "Application packet";
  if (/^\/dashboard\/listings\/[^/]+/.test(pathname) && !pathname.endsWith("/new")) {
    return "Listing";
  }
  if (pathname.startsWith("/dashboard/listings")) return "Properties";
  if (pathname.startsWith("/dashboard/applications")) return "Applications";
  return "Pipeline";
}

export function DeskFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { demo } = useRuntimeConfig();

  return (
    <PacketWindow title={titleFor(pathname)} meta={demo ? "Demo" : "Private beta"}>
      <div className="desk">
        <DeskSidebar />
        <div className="min-w-0">{children}</div>
      </div>
    </PacketWindow>
  );
}
