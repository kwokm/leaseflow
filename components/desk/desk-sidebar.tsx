"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, Home, Inbox, LayoutGrid, ScrollText } from "lucide-react";
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
    href: "/dashboard/listings",
    label: "Properties",
    icon: Home,
    match: (path: string) => path.startsWith("/dashboard/listings"),
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
] as const;

export type DeskNavLabel = (typeof NAV)[number]["label"];

const PREVIEW_NAV = NAV;

export function DeskSidebar({
  staticActive,
  preview,
}: {
  /** Landing crop: highlight this item without routing. */
  staticActive?: DeskNavLabel;
  /** Hero graphic: clickable tabs that do not leave the landing page. */
  preview?: {
    active: DeskNavLabel;
    onSelect: (label: DeskNavLabel) => void;
  };
}) {
  const pathname = usePathname();
  const items = preview ? PREVIEW_NAV : NAV;

  return (
    <aside className="desk-rail" aria-label="Desk navigation">
      {items.map((item) => {
        const active = preview
          ? item.label === preview.active
          : staticActive
            ? item.label === staticActive
            : item.match(pathname);
        const Icon = item.icon;
        const className = cn("rail-item", active && "is-active");

        if (preview) {
          return (
            <button
              key={item.label}
              type="button"
              className={className}
              aria-pressed={active}
              onClick={() => preview.onSelect(item.label)}
            >
              <Icon width={16} height={16} aria-hidden />
              {item.label}
            </button>
          );
        }

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
