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

  // Seeded 170 Chorus listing (and legacy 510 S Resh pastes) always return resh-510.
  if (isSeededZillow(url, parsed?.zpid)) {
    return NextResponse.json({
      source: "seeded",
      note: "Loaded the sample 170 Chorus, Irvine listing, so address, rent, and photos are filled.",
      listing: importToProperty(seededZillowImport()),
    });
  }

  if (!parsed) {
    return NextResponse.json(
      { error: "Use a zillow.com/homedetails/ link. Other sites are not imported." },
      { status: 400 },
    );
  }

  const live = await fetchLiveZillow(parsed.url);
  if (live) {
    return NextResponse.json({
      source: "live",
      note: "Pulled from the public page — not a Zillow partnership.",
      listing: importToProperty(live),
    });
  }

  return NextResponse.json(
    {
      error:
        "Zillow blocked the live pull. Paste the seeded Irvine listing to load the demo property, or fill the fields by hand.",
      seededUrl: seededZillowImport().zillowUrl,
    },
    { status: 422 },
  );
}
