"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CreditCard, Folder, Home, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  {
    href: "/dashboard",
    label: "Applications",
    icon: LayoutGrid,
    match: (path: string) =>
      path === "/dashboard" || path.startsWith("/dashboard/applications"),
  },
  {
    href: "/dashboard/payments",
    label: "Payments",
    icon: CreditCard,
    match: (path: string) => path.startsWith("/dashboard/payments"),
  },
  {
    href: "/dashboard/messages",
    label: "Messages",
    icon: Folder,
    match: (path: string) => path.startsWith("/dashboard/messages"),
  },
  {
    href: "/dashboard/listings",
    label: "Properties",
    icon: Home,
    match: (path: string) => path.startsWith("/dashboard/listings"),
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
