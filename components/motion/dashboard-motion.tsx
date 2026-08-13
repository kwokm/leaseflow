"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { SpatialPane } from "@/components/motion/spatial";

export function DashboardMotion({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isPacket = pathname.startsWith("/dashboard/applications/");

  if (!isPacket) {
    return children;
  }

  return <SpatialPane paneKey={pathname}>{children}</SpatialPane>;
}
