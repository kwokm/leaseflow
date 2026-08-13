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
    <aside className="hidden flex-col gap-0.5 border-r border-line bg-rail p-2 pt-2.5 sm:flex sm:w-[196px] sm:shrink-0">
      {NAV.map((item) => {
        const active = staticActive ? item.label === staticActive : item.match(pathname);
        const Icon = item.icon;
        const className = cn(
          "flex h-[34px] items-center gap-2 rounded-md px-2.5 text-[13px] font-medium tracking-[-0.2px] transition-colors duration-160 ease-premium",
          active ? "bg-paper text-ink shadow-[0_1px_2px_rgba(17,17,20,0.06)]" : "text-mute hover:text-ink"
        );

        if (staticActive) {
          return (
            <span key={item.label} className={className}>
              <Icon className="h-3.5 w-3.5" aria-hidden />
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
            <Icon className="h-3.5 w-3.5" aria-hidden />
            {item.label}
          </Link>
        );
      })}
    </aside>
  );
}
