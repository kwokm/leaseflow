"use client";

import { CraigslistDemo } from "@/components/demos/craigslist";
import { FacebookDemo } from "@/components/demos/facebook";

/** Desk helper: Facebook thread uses the Marketplace chat; Craigslist stays its own loop. */
export function MarketplaceDemo() {
  return <FacebookDemo />;
}

export { CraigslistDemo, FacebookDemo };
