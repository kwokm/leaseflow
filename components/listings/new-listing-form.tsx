"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, Link2, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Reveal, RevealItem, RevealStagger } from "@/components/motion/reveal";
import { ListingPhotoStrip } from "@/components/listings/photos";
import { useRuntimeConfig } from "@/components/config/runtime-config";
import { createListing } from "@/lib/listings/store";
import { SEEDED_ZILLOW_URL } from "@/lib/listings/zillow";
import {
  STANDARD_PRICING_STORY,
  STANDARD_SCREENING_FEE,
  type ScreeningPackage,
} from "@/lib/data/mock-data";
import type { ListingPreview } from "@/lib/listings/import-listing";

export type ListingEntryMode = "choose" | "import" | "manual";

type FormState = {
  address: string;
  rent: string;
  bedrooms: string;
  bathrooms: string;
  sqft: string;
  neighborhood: string;
  availableDate: string;
  screeningPackage: ScreeningPackage;
};

const EMPTY_FORM: FormState = {
  address: "",
  rent: "",
  bedrooms: "",
  bathrooms: "",
  sqft: "",
  neighborhood: "",
  availableDate: "2026-09-01",
  screeningPackage: "standard",
};

function formFromPreview(preview: ListingPreview): FormState {
  return {
    address: preview.address ?? "",
    rent: preview.rent ? String(preview.rent) : "",
    bedrooms: preview.bedrooms ? String(preview.bedrooms) : "",
    bathrooms: preview.bathrooms ? String(preview.bathrooms) : "",
    sqft: preview.sqft ? String(preview.sqft) : "",
    neighborhood: preview.neighborhood ?? "",
    availableDate: "2026-09-01",
    screeningPackage: "standard",
  };
}

export function NewListingForm({ initialMode }: { initialMode: ListingEntryMode }) {
  const router = useRouter();
  const { demo } = useRuntimeConfig();
  const [mode, setMode] = useState<ListingEntryMode>(initialMode);
  const [sourceUrl, setSourceUrl] = useState("");
  const [pulling, setPulling] = useState(false);
  const [pullNote, setPullNote] = useState<string | null>(null);
  const [pullError, setPullError] = useState<string | null>(null);
  const [preview, setPreview] = useState<ListingPreview | null>(null);
  const [formData, setFormData] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const showImport = mode === "import";
  const showForm = mode === "import" || mode === "manual";

  const applyPreview = (next: ListingPreview, note: string) => {
    setPreview(next);
    setFormData(formFromPreview(next));
    setPullNote(note);
    setPullError(null);
  };

  const pullListing = async (url = sourceUrl) => {
    const trimmed = url.trim();
    if (!trimmed) {
      setPullError("Paste a Zillow, Redfin, or Realtor.com listing URL first.");
      return;
    }

    setPulling(true);
    setPullError(null);
    setPullNote(null);

    try {
      const response = await fetch("/api/listings/import", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });
      const payload = (await response.json()) as {
        preview?: ListingPreview | null;
        note?: string;
        error?: string;
      };

      if (!response.ok || !payload.preview?.address) {
        if (payload.preview) {
          applyPreview(
            payload.preview,
            payload.note ?? "Partial fields only — finish the rest by hand."
          );
        }
        setPullError(
          payload.error ??
            "Could not import that listing. Portals often block automated reads. Use the form."
        );
        setMode("manual");
        return;
      }

      applyPreview(payload.preview, payload.note ?? "Listing pulled.");
    } catch {
      setPullError(
        "Could not reach the import. Portals often block automated reads. Finish the form by hand."
      );
      setMode("manual");
    } finally {
      setPulling(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setSaveError(null);

    try {
      const listing = await createListing({
        address: formData.address,
        rent: Number(formData.rent) || 0,
        bedrooms: Number(formData.bedrooms) || 0,
        bathrooms: Number(formData.bathrooms) || 0,
        availableDate: formData.availableDate,
        photos: preview?.photos ?? [],
        sqft: formData.sqft ? Number(formData.sqft) : preview?.sqft,
        zillowUrl: preview?.sourceUrl ?? sourceUrl.trim() ?? undefined,
        zpid: preview?.zpid,
        neighborhood: formData.neighborhood || preview?.neighborhood,
        propertyType: preview?.propertyType,
      });
      router.push(`/dashboard/listings/${listing.id}`);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Could not save that listing.");
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 p-5 sm:p-6">
      <Reveal>
        <Link href="/dashboard/listings">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to properties
          </Button>
        </Link>
        <h1 className="text-[28px] font-semibold tracking-[-0.7px] text-ink">
          {mode === "import" ? "Import a listing" : "Create a listing"}
        </h1>
        <p className="text-mute mt-1">
          {mode === "choose"
            ? "Add the address and rent yourself. Import from a public URL is a fallback — portals often block automated reads."
            : mode === "import"
              ? "Paste a Zillow, Redfin, or Realtor.com URL. We only keep fields we actually read. If the site blocks us, you will land on the form with whatever came back — nothing is invented."
              : "Fill the address and rent. Import is optional and often hits a bot wall."}
        </p>
      </Reveal>

      {mode === "choose" ? (
        <RevealStagger className="grid gap-4 md:grid-cols-2">
          <RevealItem>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PenLine className="h-4 w-4" aria-hidden />
                  Add listing
                </CardTitle>
                <CardDescription>
                  Type the address, rent, and beds yourself. This is the path that always works.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button type="button" onClick={() => setMode("manual")}>
                  Add listing
                </Button>
              </CardContent>
            </Card>
          </RevealItem>
          <RevealItem>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link2 className="h-4 w-4" aria-hidden />
                  Import listing
                </CardTitle>
                <CardDescription>
                  Optional. Paste a public Zillow, Redfin, or Realtor.com URL. Those sites often
                  block automated reads — if they do, you finish the form by hand.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button type="button" variant="outline" onClick={() => setMode("import")}>
                  Import listing
                </Button>
              </CardContent>
            </Card>
          </RevealItem>
        </RevealStagger>
      ) : null}

      {showForm ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <RevealStagger className="space-y-6">
            {showImport ? (
              <RevealItem>
                <Card>
                  <CardHeader>
                    <CardTitle>Paste a listing URL</CardTitle>
                    <CardDescription>
                      Homedetails, Redfin /home/, and Realtor.com listing pages. We read JSON-LD and
                      Open Graph from the public page — not a portal partnership. Those sites often
                      show a bot wall; if they do we leave you on this form with whatever we read.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="listing-url">Listing URL</Label>
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <Input
                          id="listing-url"
                          type="url"
                          inputMode="url"
                          placeholder="https://www.zillow.com/homedetails/…"
                          value={sourceUrl}
                          onChange={(event) => setSourceUrl(event.target.value)}
                          onPaste={(event) => {
                            const pasted = event.clipboardData.getData("text").trim();
                            if (pasted) {
                              setSourceUrl(pasted);
                              void pullListing(pasted);
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          disabled={pulling}
                          onClick={() => void pullListing()}
                        >
                          {pulling ? "Reading…" : "Preview listing"}
                        </Button>
                      </div>
                      {demo ? (
                        <button
                          type="button"
                          className="text-[12px] font-medium text-mute underline-offset-2 hover:text-ink hover:underline"
                          onClick={() => {
                            setSourceUrl(SEEDED_ZILLOW_URL);
                            void pullListing(SEEDED_ZILLOW_URL);
                          }}
                        >
                          Use the seeded Irvine listing
                        </button>
                      ) : null}
                    </div>

                    {pullError ? (
                      <p role="alert" className="text-[13px] font-medium text-no">
                        {pullError}
                      </p>
                    ) : null}
                    {pullNote ? (
                      <p className="text-[13px] font-medium text-mute">{pullNote}</p>
                    ) : null}

                    {preview?.photos.length ? (
                      <div className="space-y-2">
                        <p className="text-[13px] font-medium text-ink">Pulled photos</p>
                        <ListingPhotoStrip
                          photos={preview.photos}
                          alt={preview.address ?? "Imported listing"}
                          size="md"
                        />
                      </div>
                    ) : preview ? (
                      <p className="text-[13px] font-medium text-mute">
                        No photos came back from that page. You can still save the listing.
                      </p>
                    ) : null}

                    <button
                      type="button"
                      className="text-[12px] font-medium text-mute underline-offset-2 hover:text-ink hover:underline"
                      onClick={() => setMode("manual")}
                    >
                      Skip import and fill the form by hand
                    </button>
                  </CardContent>
                </Card>
              </RevealItem>
            ) : (
              <RevealItem>
                <p className="text-[13px] font-medium text-mute">
                  Have a Zillow or Redfin link?{" "}
                  <button
                    type="button"
                    className="underline-offset-2 hover:text-ink hover:underline"
                    onClick={() => setMode("import")}
                  >
                    Import listing
                  </button>
                  {" "}
                  — optional. Portals often block automated reads.
                </p>
                {pullError ? (
                  <p role="alert" className="mt-2 text-[13px] font-medium text-no">
                    {pullError}
                  </p>
                ) : null}
                {pullNote && !showImport ? (
                  <p className="mt-2 text-[13px] font-medium text-mute">{pullNote}</p>
                ) : null}
              </RevealItem>
            )}

            <RevealItem>
              <Card>
                <CardHeader>
                  <CardTitle>Property details</CardTitle>
                  <CardDescription>
                    {preview
                      ? "Edit anything the import missed before you save."
                      : "Required to create a listing you can screen against."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">Property address *</Label>
                    <Input
                      id="address"
                      placeholder="123 Main Street, City, State ZIP"
                      value={formData.address}
                      onChange={(event) => setFormData({ ...formData, address: event.target.value })}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <div className="space-y-2">
                      <Label htmlFor="bedrooms">Bedrooms *</Label>
                      <Input
                        id="bedrooms"
                        type="number"
                        min="0"
                        placeholder="4"
                        value={formData.bedrooms}
                        onChange={(event) =>
                          setFormData({ ...formData, bedrooms: event.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bathrooms">Bathrooms *</Label>
                      <Input
                        id="bathrooms"
                        type="number"
                        min="0"
                        step="0.5"
                        placeholder="3.5"
                        value={formData.bathrooms}
                        onChange={(event) =>
                          setFormData({ ...formData, bathrooms: event.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sqft">Sqft</Label>
                      <Input
                        id="sqft"
                        type="number"
                        min="0"
                        placeholder="3010"
                        value={formData.sqft}
                        onChange={(event) => setFormData({ ...formData, sqft: event.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rent">Monthly rent *</Label>
                      <Input
                        id="rent"
                        type="number"
                        min="0"
                        placeholder="6500"
                        value={formData.rent}
                        onChange={(event) => setFormData({ ...formData, rent: event.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="neighborhood">Neighborhood</Label>
                      <Input
                        id="neighborhood"
                        placeholder="Rise Park"
                        value={formData.neighborhood}
                        onChange={(event) =>
                          setFormData({ ...formData, neighborhood: event.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="availableDate">Available date *</Label>
                      <Input
                        id="availableDate"
                        type="date"
                        value={formData.availableDate}
                        onChange={(event) =>
                          setFormData({ ...formData, availableDate: event.target.value })
                        }
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </RevealItem>

            <RevealItem>
              <Card>
                <CardHeader>
                  <CardTitle>Screening package</CardTitle>
                  <CardDescription>{STANDARD_PRICING_STORY}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg border border-line bg-wash/40 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="mb-1 text-lg font-semibold">Standard</div>
                        <div className="mb-3 text-sm text-mute">
                          ${STANDARD_SCREENING_FEE.toFixed(2)} per applicant · includes everything
                        </div>
                      </div>
                      <span
                        aria-hidden
                        className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-ink bg-ink text-paper"
                      >
                        <Check className="h-3 w-3" strokeWidth={3} />
                      </span>
                    </div>
                    <ul className="space-y-1.5 text-sm text-ink-2">
                      <li className="flex items-start gap-2">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-ok" aria-hidden />
                        Credit, background, ID, and the packet
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-ok" aria-hidden />
                        AI Income Check and bank verification
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-ok" aria-hidden />
                        Applicants can apply to as many homes as they want
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </RevealItem>

            <RevealItem>
              {saveError ? (
                <p
                  role="alert"
                  className="mb-3 rounded-btn border border-no bg-no-bg px-4 py-3 text-[14px] font-medium leading-5 text-no"
                >
                  {saveError}
                </p>
              ) : null}
              <div className="flex gap-4">
                <Button type="submit" size="lg" className="flex-1" disabled={saving}>
                  {saving ? "Creating…" : preview ? "Create imported listing" : "Create Listing"}
                </Button>
                <Link href="/dashboard">
                  <Button type="button" variant="outline" size="lg">
                    Cancel
                  </Button>
                </Link>
              </div>
            </RevealItem>
          </RevealStagger>
        </form>
      ) : null}
    </div>
  );
}
