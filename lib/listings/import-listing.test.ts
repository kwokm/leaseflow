import assert from "node:assert/strict";
import { test } from "node:test";
import {
  detectBotWall,
  ImportListingError,
  looksLikeAddress,
  parseListingHtml,
  parseListingUrl,
} from "./import-listing.ts";

const ZILLOW_HTML = `<!doctype html>
<html>
<head>
  <meta property="og:title" content="170 Chorus, Irvine, CA 92618 | Zillow" />
  <meta property="og:image" content="https://photos.zillowstatic.com/fp/front.jpg" />
  <meta property="og:description" content="4 beds, 3.5 baths, 3,010 sqft. $6,500/mo" />
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "SingleFamilyResidence",
    "name": "170 Chorus, Irvine, CA 92618",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "170 Chorus",
      "addressLocality": "Irvine",
      "addressRegion": "CA",
      "postalCode": "92618"
    },
    "numberOfBedrooms": 4,
    "numberOfBathroomsTotal": 3.5,
    "floorSize": { "@type": "QuantitativeValue", "value": 3010, "unitCode": "FTK" },
    "image": [
      "https://photos.zillowstatic.com/fp/one.jpg",
      "https://photos.zillowstatic.com/fp/two.jpg"
    ]
  }
  </script>
</head>
</html>`;

const REDFIN_HTML = `<!doctype html>
<html>
<head>
  <meta property="og:title" content="123 Main St, San Francisco, CA 94105 | Redfin" />
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": ["Product", "RealEstateListing"],
    "name": "123 Main St, San Francisco, CA 94105",
    "image": "https://ssl.cdn-redfin.com/photo/1/bigphoto/123.jpg",
    "offers": { "@type": "Offer", "price": 4200, "priceCurrency": "USD" },
    "mainEntity": {
      "@type": "SingleFamilyResidence",
      "address": {
        "streetAddress": "123 Main St",
        "addressLocality": "San Francisco",
        "addressRegion": "CA",
        "postalCode": "94105"
      },
      "numberOfBedrooms": 3,
      "numberOfBathroomsTotal": 2,
      "floorSize": { "value": 1400 }
    }
  }
  </script>
</head>
</html>`;

const REALTOR_HTML = `<!doctype html>
<html>
<head>
  <meta property="og:title" content="456 Oak Ave, Austin, TX 78702 | realtor.com" />
  <meta property="og:image" content="https://ap.rdcpix.com/abc/photoid.jpg" />
  <meta property="og:description" content="2 bed, 2 bath, 1,100 sqft house for rent. $2,450/mo" />
  <meta property="product:price:amount" content="2450" />
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Residence",
    "address": {
      "streetAddress": "456 Oak Ave",
      "addressLocality": "Austin",
      "addressRegion": "TX",
      "postalCode": "78702"
    },
    "numberOfBedrooms": 2,
    "numberOfBathroomsTotal": 2,
    "floorSize": { "value": 1100 }
  }
  </script>
</head>
</html>`;

test("accepts verified Zillow, Redfin, and Realtor URL shapes", () => {
  const zillow = parseListingUrl(
    "https://www.zillow.com/homedetails/170-Chorus-Irvine-CA-92618/12345678_zpid/"
  );
  assert.equal(zillow.portal, "zillow");
  assert.equal(zillow.zpid, "12345678");

  const zillowHomes = parseListingUrl(
    "https://www.zillow.com/homes/170-Chorus,-Irvine,-CA-92618_rb/"
  );
  assert.equal(zillowHomes.portal, "zillow");

  const redfin = parseListingUrl(
    "https://www.redfin.com/CA/San-Francisco/123-Main-St-94105/home/12345678"
  );
  assert.equal(redfin.portal, "redfin");

  const realtor = parseListingUrl(
    "https://www.realtor.com/realestateandhomes-detail/456-Oak-Ave_M12345"
  );
  assert.equal(realtor.portal, "realtor");
});

test("rejects search pages, private hosts, and unknown sites", () => {
  assert.throws(
    () => parseListingUrl("https://www.zillow.com/irvine-ca/"),
    (error: unknown) => error instanceof ImportListingError && error.code === "not_a_listing"
  );
  assert.throws(
    () => parseListingUrl("https://www.redfin.com/city/11203/CA/Irvine"),
    (error: unknown) => error instanceof ImportListingError && error.code === "not_a_listing"
  );
  assert.throws(
    () => parseListingUrl("https://127.0.0.1/homedetails/x"),
    (error: unknown) => error instanceof ImportListingError && error.code === "private_url"
  );
  assert.throws(
    () => parseListingUrl("https://example.com/not-a-listing"),
    (error: unknown) => error instanceof ImportListingError && error.code === "not_a_listing"
  );
});

test("parses Zillow JSON-LD without inventing fields", () => {
  const preview = parseListingHtml(
    ZILLOW_HTML,
    "https://www.zillow.com/homedetails/170-Chorus-Irvine-CA-92618/123_zpid/",
    "zillow"
  );
  assert.equal(preview.address, "170 Chorus, Irvine, CA 92618");
  assert.equal(preview.rent, 6500);
  assert.equal(preview.bedrooms, 4);
  assert.equal(preview.bathrooms, 3.5);
  assert.equal(preview.sqft, 3010);
  assert.ok(preview.photos.includes("https://photos.zillowstatic.com/fp/one.jpg"));
  assert.equal(preview.zpid, "123");
});

test("parses Redfin RealEstateListing JSON-LD", () => {
  const preview = parseListingHtml(
    REDFIN_HTML,
    "https://www.redfin.com/CA/San-Francisco/123-Main-St-94105/home/12345678",
    "redfin"
  );
  assert.equal(preview.address, "123 Main St, San Francisco, CA 94105");
  assert.equal(preview.rent, 4200);
  assert.equal(preview.bedrooms, 3);
  assert.equal(preview.bathrooms, 2);
  assert.equal(preview.sqft, 1400);
  assert.ok(preview.photos.some((url) => url.includes("cdn-redfin.com")));
});

test("parses Realtor.com residence JSON-LD plus OG", () => {
  const preview = parseListingHtml(
    REALTOR_HTML,
    "https://www.realtor.com/realestateandhomes-detail/456-Oak-Ave_M12345",
    "realtor"
  );
  assert.equal(preview.address, "456 Oak Ave, Austin, TX 78702");
  assert.equal(preview.rent, 2450);
  assert.equal(preview.bedrooms, 2);
  assert.equal(preview.photos[0], "https://ap.rdcpix.com/abc/photoid.jpg");
});

test("does not invent address, rent, or photos", () => {
  assert.throws(
    () =>
      parseListingHtml(
        `<html><head><meta property="og:title" content="About us" /></head><body>Hello</body></html>`,
        "https://www.zillow.com/homedetails/x/1_zpid/",
        "zillow"
      ),
    (error: unknown) => error instanceof ImportListingError && error.code === "not_a_listing"
  );

  const sale = parseListingHtml(
    `<html><head>
      <meta property="og:title" content="88 Broad St, Boston, MA 02110 | Zillow" />
      <script type="application/ld+json">
      { "@type": "SingleFamilyResidence",
        "address": { "streetAddress": "88 Broad St", "addressLocality": "Boston", "addressRegion": "MA", "postalCode": "02110" },
        "offers": { "price": 1250000 } }
      </script>
    </head></html>`,
    "https://www.zillow.com/homedetails/88-Broad/9_zpid/",
    "zillow"
  );
  assert.equal(sale.address, "88 Broad St, Boston, MA 02110");
  assert.equal(sale.rent, undefined);
  assert.deepEqual(sale.photos, []);
});

test("drops social thumbnails from pulled photos", () => {
  const preview = parseListingHtml(
    `<html><head>
      <meta property="og:title" content="170 Chorus, Irvine, CA 92618 | Zillow" />
      <meta property="og:image" content="https://photos.zillowstatic.com/fp/front-cc_ft_1536.jpg" />
      <meta property="og:image" content="https://www.zillowstatic.com/static/images/social/share_thumbnail.png" />
    </head></html>`,
    "https://www.zillow.com/homedetails/170-Chorus/1_zpid/",
    "zillow"
  );
  assert.deepEqual(preview.photos, ["https://photos.zillowstatic.com/fp/front-cc_ft_1536.jpg"]);
});

test("detects a bot wall and rejects non-addresses", () => {
  assert.equal(detectBotWall("<html><title>Just a moment...</title><body>Enable JavaScript and cookies to continue</body></html>", 200), true);
  assert.equal(detectBotWall("<html><body>ok</body></html>", 403), true);
  assert.equal(looksLikeAddress("Homes for Sale"), false);
  assert.equal(looksLikeAddress("170 Chorus, Irvine, CA 92618"), true);
});
