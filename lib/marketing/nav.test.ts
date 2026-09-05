import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { MARKETING_NAV, isMarketingNavActive } from "./nav.ts";

test("public nav is exactly Products, Pricing, Resources, About us", () => {
  assert.deepEqual(
    MARKETING_NAV.map((item) => item.label),
    ["Products", "Pricing", "Resources", "About us"],
  );
  assert.deepEqual(
    MARKETING_NAV.map((item) => item.href),
    ["/products", "/pricing", "/resources", "/about"],
  );
  assert.equal(isMarketingNavActive("/products", "/products"), true);
  assert.equal(isMarketingNavActive("/pricing", "/products"), false);
});

test("landing and public shells use the shared site header", () => {
  const landing = readFileSync(new URL("../../app/page.tsx", import.meta.url), "utf8");
  const header = readFileSync(new URL("../../components/site-header.tsx", import.meta.url), "utf8");
  const legal = readFileSync(new URL("../../components/legal/legal-page.tsx", import.meta.url), "utf8");
  assert.match(landing, /SiteHeader/);
  assert.match(legal, /SiteHeader/);
  assert.match(header, /MARKETING_NAV/);
  assert.match(header, /Sign in/);
  assert.match(header, /Sign up/);
  assert.doesNotMatch(header, /Solutions/);
  assert.doesNotMatch(header, /Developer/);
});

test("marketing pages explain products, pricing, resources, and about", () => {
  const products = readFileSync(new URL("../../app/products/page.tsx", import.meta.url), "utf8");
  const pricing = readFileSync(new URL("../../app/pricing/page.tsx", import.meta.url), "utf8");
  const resources = readFileSync(new URL("../../app/resources/page.tsx", import.meta.url), "utf8");
  const about = readFileSync(new URL("../../app/about/page.tsx", import.meta.url), "utf8");

  assert.match(products, /Experian Connect/);
  assert.match(products, /AI Income Check/);
  assert.match(products, /applicant-permissioned/);
  assert.match(products, /read from the upload/i);
  assert.match(products, /SAMPLE/);
  assert.doesNotMatch(products, /verified by Leaseproof/i);
  assert.doesNotMatch(products, /AI Income\./);

  assert.match(pricing, /\$24\.99/);
  assert.match(pricing, /\$0 extra for landlords/);
  assert.match(pricing, /invite-only/);
  assert.doesNotMatch(pricing, /LEASEPROOF_LIVE_FEES/);
  assert.doesNotMatch(pricing, /LEASEPROOF_DEMO/);

  assert.match(resources, /\/apply\//);
  assert.match(resources, /listingId/);
  assert.match(resources, /aaisuzukillc@gmail\.com|BetaContactLink/);
  assert.match(resources, /FCRA/);
  assert.match(resources, /\/privacy/);
  assert.match(resources, /\/terms/);

  assert.match(about, /AAI Suzuki LLC/);
  assert.match(about, /Orange County/);
  assert.match(about, /landlord decides/i);
  assert.doesNotMatch(about, /realtor/i);
});
