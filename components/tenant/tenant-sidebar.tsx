"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CreditCard, Folder, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  {
    href: "/tenant",
    label: "Application",
    icon: LayoutGrid,
    match: (path: string) => path === "/tenant" || path.startsWith("/tenant/applications"),
  },
  {
    href: "/tenant/messages",
    label: "Messages",
    icon: Folder,
    match: (path: string) => path.startsWith("/tenant/messages"),
  },
  {
    href: "/tenant/payments",
    label: "Payments",
    icon: CreditCard,
    match: (path: string) => path.startsWith("/tenant/payments"),
  },
] as const;

export function TenantSidebar() {
  const pathname = usePathname();

  return (
    <aside className="desk-rail" aria-label="Tenant desk navigation">
      {NAV.map((item) => {
        const active = item.match(pathname);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn("rail-item", active && "is-active")}
          >
            <Icon width={16} height={16} aria-hidden />
            {item.label}
          </Link>
        );
      })}
    </aside>
  );
}
