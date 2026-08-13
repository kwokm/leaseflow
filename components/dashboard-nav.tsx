"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ClipboardList,
  CreditCard,
  MessageSquare,
  Building2,
  Settings,
} from "lucide-react";
import { mockThreads } from "@/lib/data/mock-data";

const primaryNav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/applications", label: "Applications", icon: ClipboardList },
  { href: "/dashboard/payments", label: "Payments", icon: CreditCard },
  { href: "/dashboard/messages", label: "Messages", icon: MessageSquare },
];

// Properties lives below the day-to-day workflow items
const secondaryNav = [{ href: "/dashboard/listings", label: "Properties", icon: Building2 }];

function isActive(pathname: string, href: string, exact?: boolean) {
  return exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

export function DashboardNav() {
  const pathname = usePathname();
  const unread = mockThreads.reduce((sum, thread) => sum + thread.unread, 0);

  return (
    <nav className="space-y-1">
      {primaryNav.map((item) => {
        const active = isActive(pathname, item.href, item.exact);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-opacity duration-200 ease-out",
              active
                ? "bg-primary/10 text-primary"
                : "text-ink-2 hover:opacity-90"
            )}
          >
            <item.icon className="h-4 w-4 transition-transform duration-200 ease-out group-hover:scale-110" />
            <span className="flex-1">{item.label}</span>
            {item.label === "Messages" && unread > 0 && (
              <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
                {unread}
              </span>
            )}
          </Link>
        );
      })}

      <div className="pt-4">
        <div className="px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-mute-3">
          Manage
        </div>
        {secondaryNav.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-opacity duration-200 ease-out",
                active
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-mute hover:opacity-90"
              )}
            >
              <item.icon className="h-4 w-4 transition-transform duration-200 ease-out group-hover:scale-110" />
              {item.label}
            </Link>
          );
        })}
        <div
          aria-disabled="true"
          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-mute-3"
        >
          <Settings className="w-4 h-4" />
          <span className="flex-1">Settings</span>
          <span className="text-xs">Soon</span>
        </div>
      </div>
    </nav>
  );
}
