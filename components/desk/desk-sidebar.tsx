"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, CreditCard, Home, Inbox, LayoutGrid, ScrollText } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  {
    href: "/dashboard",
    label: "Pipeline",
    icon: LayoutGrid,
    match: (path: string) =>
      path === "/dashboard" || path.startsWith("/dashboard/leases"),
  },
  {
    href: "/dashboard/applications",
    label: "Applications",
    icon: ScrollText,
    match: (path: string) => path.startsWith("/dashboard/applications"),
  },
  {
    href: "/dashboard/leads",
    label: "Leads",
    icon: Inbox,
    match: (path: string) =>
      path.startsWith("/dashboard/leads") || path.startsWith("/dashboard/messages"),
  },
  {
    href: "/dashboard/showings",
    label: "Showings",
    icon: Calendar,
    match: (path: string) => path.startsWith("/dashboard/showings"),
  },
  {
    href: "/dashboard/listings",
    label: "Properties",
    icon: Home,
    match: (path: string) => path.startsWith("/dashboard/listings"),
  },
  {
    href: "/dashboard/payments",
    label: "Payments",
    icon: CreditCard,
    match: (path: string) => path.startsWith("/dashboard/payments"),
  },
] as const;

export function DeskSidebar({
  staticActive,
}: {
  /** Landing crop: highlight this item without routing. */
  staticActive?: (typeof NAV)[number]["label"];
}) {
  const pathname = usePathname();

  return (
    <aside className="desk-rail" aria-label="Desk navigation">
      {NAV.map((item) => {
        const active = staticActive ? item.label === staticActive : item.match(pathname);
        const Icon = item.icon;
        const className = cn("rail-item", active && "is-active");

        if (staticActive) {
          return (
            <span key={item.label} className={className}>
              <Icon width={16} height={16} aria-hidden />
              {item.label}
            </span>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={className}
          >
            <Icon width={16} height={16} aria-hidden />
            {item.label}
          </Link>
        );
      })}
    </aside>
  );
}
