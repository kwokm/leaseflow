"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { BrandMark, BrandWord } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { MARKETING_NAV, isMarketingNavActive } from "@/lib/marketing/nav";
import { LANDLORD_SIGN_IN_HREF, LANDLORD_SIGN_UP_HREF } from "@/lib/auth/roles";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="relative z-50 bg-white">
      <div className="relative mx-auto flex h-16 max-w-header items-center gap-4 px-5 sm:px-8 lg:px-14">
        <Link
          href="/"
          aria-label="Leaseproof home"
          className="flex shrink-0 items-center gap-2.5 text-ink"
        >
          <BrandMark />
          <BrandWord />
        </Link>

        <nav
          aria-label="Site"
          className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-7 md:flex"
        >
          {MARKETING_NAV.map((item) => {
            const active = isMarketingNavActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "text-[13px] font-medium tracking-[-0.13px] transition-colors",
                  active ? "text-ink" : "text-mute hover:text-ink",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-btn text-ink md:hidden"
            aria-expanded={open}
            aria-controls="site-nav-mobile"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((current) => !current)}
          >
            {open ? <X width={18} height={18} /> : <Menu width={18} height={18} />}
          </button>
          <Button asChild variant="ghost">
            <Link href={LANDLORD_SIGN_IN_HREF}>Sign in</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={LANDLORD_SIGN_UP_HREF}>Sign up</Link>
          </Button>
        </div>
      </div>

      {open ? (
        <nav
          id="site-nav-mobile"
          aria-label="Site"
          className="absolute left-0 right-0 top-16 z-50 border-b border-line bg-white px-5 py-3 shadow-mini md:hidden"
        >
          <ul className="flex flex-col gap-1">
            {MARKETING_NAV.map((item) => {
              const active = isMarketingNavActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "block rounded-md px-2 py-2 text-[16px] font-medium leading-[22px] tracking-[-0.16px]",
                      active ? "bg-wash text-ink" : "text-ink hover:bg-mist",
                    )}
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
