export const MARKETING_NAV = [
  { href: "/products", label: "Products" },
  { href: "/pricing", label: "Pricing" },
  { href: "/resources", label: "Resources" },
  { href: "/about", label: "About us" },
] as const;

export type MarketingNavHref = (typeof MARKETING_NAV)[number]["href"];

export function isMarketingNavActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
