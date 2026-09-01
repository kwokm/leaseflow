import { NextResponse } from "next/server";
import {
  fetchLiveZillow,
  importToProperty,
  isSeededZillow,
  parseZillowUrl,
  seededZillowImport,
} from "@/lib/listings/zillow";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: { url?: unknown };
  try {
    body = (await request.json()) as { url?: unknown };
  } catch {
    return NextResponse.json({ error: "Send a JSON body with a Zillow URL." }, { status: 400 });
  }

  const url = typeof body.url === "string" ? body.url.trim() : "";
  if (!url) {
    return NextResponse.json({ error: "Paste a Zillow homedetails URL." }, { status: 400 });
  }

  const parsed = parseZillowUrl(url);
  if (!parsed) {
    return NextResponse.json(
      { error: "Use a zillow.com/homedetails/ link. Other sites are not imported." },
      { status: 400 },
    );
  }

  // Seeded Anaheim listing always returns the guaranteed demo payload.
  if (isSeededZillow(parsed.url, parsed.zpid)) {
    return NextResponse.json({
      source: "seeded",
      note: "Prototype import. Seeded 510 S Resh St so the demo always has address, rent, and photos.",
      listing: importToProperty(seededZillowImport()),
    });
  }

  const live = await fetchLiveZillow(parsed.url);
  if (live) {
    return NextResponse.json({
      source: "live",
      note: "Pulled from the page. Prototype import — not a Zillow partnership.",
      listing: importToProperty(live),
    });
  }

  return NextResponse.json(
    {
      error:
        "Zillow blocked the live pull. Paste the seeded Anaheim listing to load the demo property, or fill the fields by hand.",
      seededUrl: seededZillowImport().zillowUrl,
    },
    { status: 422 },
  );
}
