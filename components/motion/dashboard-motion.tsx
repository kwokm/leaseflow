"use client";

import { usePathname } from "next/navigation";
import { useRef } from "react";
import type { ReactNode } from "react";
import { SpatialPane } from "@/components/motion/spatial";

/**
 * Packet/page changes are fade + small y. First paint is skipped so
 * SpatialMount on the card can own “Open the desk.”
 */
export function DashboardMotion({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const firstPaint = useRef(true);

  if (firstPaint.current) {
    firstPaint.current = false;
    return children;
  }

  return <SpatialPane paneKey={pathname}>{children}</SpatialPane>;
}
