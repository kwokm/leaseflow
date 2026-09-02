'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Check } from "lucide-react";
import { Reveal, RevealItem, RevealStagger } from "@/components/motion/reveal";
import { ListingPhotoStrip } from "@/components/listings/photos";
import { saveListing } from "@/lib/listings/store";
import { SEEDED_ZILLOW_URL } from "@/lib/listings/zillow";
import {
  STANDARD_SCREENING_FEE,
  STANDARD_PRICING_STORY,
  type Property,
  type ScreeningPackage,
} from "@/lib/data/mock-data";

type FormState = {
  address: string;
  rent: string;
  bedrooms: string;
  bathrooms: string;
  sqft: string;
  availableDate: string;
  screeningPackage: ScreeningPackage;
};

const EMPTY_FORM: FormState = {
  address: "",
  rent: "",
  bedrooms: "",
  bathrooms: "",
  sqft: "",
  availableDate: "2026-09-01",
  screeningPackage: "standard",
};

function formFromListing(listing: Property): FormState {
  return {
    address: listing.address,
    rent: listing.rent ? String(listing.rent) : "",
    bedrooms: listing.bedrooms ? String(listing.bedrooms) : "",
    bathrooms: listing.bathrooms ? String(listing.bathrooms) : "",
    sqft: listing.sqft ? String(listing.sqft) : "",
    availableDate: listing.availableDate || "2026-09-01",
    screeningPackage: listing.screeningPackage,
  };
}

export default function NewListingPage() {
  const router = useRouter();
  const [zillowUrl, setZillowUrl] = useState("");
  const [pulling, setPulling] = useState(false);
  const [pullNote, setPullNote] = useState<string | null>(null);
  const [pullError, setPullError] = useState<string | null>(null);
  const [pulled, setPulled] = useState<Property | null>(null);
  const [formData, setFormData] = useState<FormState>(EMPTY_FORM);

  const applyListing = (listing: Property, note: string) => {
    setPulled(listing);
    setFormData(formFromListing(listing));
    setPullNote(note);
    setPullError(null);
  };

  const pullListing = async (url = zillowUrl) => {
    const trimmed = url.trim();
    if (!trimmed) {
      setPullError("Paste a Zillow homedetails URL first.");
      return;
    }

    setPulling(true);
    setPullError(null);
    setPullNote(null);

    try {
      const response = await fetch("/api/listings/from-zillow", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });
      const payload = (await response.json()) as {
        listing?: Property;
        note?: string;
        error?: string;
        seededUrl?: string;
      };

      if (!response.ok || !payload.listing) {
        setPullError(payload.error ?? "Could not pull that listing.");
        return;
      }

      applyListing(payload.listing, payload.note ?? "Listing pulled.");
    } catch {
      setPullError("Could not reach the import. Try the seeded Irvine listing, or fill the fields by hand.");
    } finally {
      setPulling(false);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const listingId = pulled?.id ?? `listing-${Date.now()}`;
    const listing: Property = {
      id: listingId,
      address: formData.address,
      rent: Number(formData.rent) || 0,
      bedrooms: Number(formData.bedrooms) || 0,
      bathrooms: Number(formData.bathrooms) || 0,
      availableDate: formData.availableDate,
      screeningPackage: "standard",
      applyUrl: `/apply/${listingId}`,
      createdAt: pulled?.createdAt ?? new Date().toISOString(),
      photos: pulled?.photos ?? [],
      sqft: formData.sqft ? Number(formData.sqft) : pulled?.sqft,
      zillowUrl: pulled?.zillowUrl ?? zillowUrl.trim() ?? undefined,
      zpid: pulled?.zpid,
      neighborhood: pulled?.neighborhood,
      propertyType: pulled?.propertyType,
    };
    saveListing(listing);
    router.push(`/dashboard/listings/${listing.id}`);
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
        <h1 className="text-[28px] font-semibold tracking-[-0.7px] text-ink">Create a listing</h1>
        <p className="text-mute mt-1">
          Paste a Zillow link to pull address, rent, and photos. Prototype import — not a Zillow partnership.
        </p>
      </Reveal>

      <form onSubmit={handleSubmit} className="space-y-6">
        <RevealStagger className="space-y-6">
          <RevealItem>
            <Card>
              <CardHeader>
                <CardTitle>Paste a Zillow link</CardTitle>
                <CardDescription>
                  Homedetails URLs only. The seeded Irvine listing always fills even if Zillow blocks a live pull.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="zillow">Zillow URL</Label>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Input
                      id="zillow"
                      type="url"
                      inputMode="url"
                      placeholder="https://www.zillow.com/homedetails/..."
                      value={zillowUrl}
                      onChange={(event) => setZillowUrl(event.target.value)}
                      onPaste={(event) => {
                        const pasted = event.clipboardData.getData("text").trim();
                        if (pasted) {
                          setZillowUrl(pasted);
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
                      {pulling ? "Pulling…" : "Pull listing"}
                    </Button>
                  </div>
                  <button
                    type="button"
                    className="text-[12px] font-medium text-mute underline-offset-2 hover:text-ink hover:underline"
                    onClick={() => {
                      setZillowUrl(SEEDED_ZILLOW_URL);
                      void pullListing(SEEDED_ZILLOW_URL);
                    }}
                  >
                    Use the seeded Irvine listing
                  </button>
                </div>

                {pullError ? (
                  <p className="text-[13px] font-medium text-no">{pullError}</p>
                ) : null}
                {pullNote ? (
                  <p className="text-[13px] font-medium text-mute">{pullNote}</p>
                ) : null}

                {pulled?.photos?.length ? (
                  <div className="space-y-2">
                    <p className="text-[13px] font-medium text-ink">Pulled photos</p>
                    <ListingPhotoStrip photos={pulled.photos} alt={pulled.address} size="md" />
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </RevealItem>

          <RevealItem>
            <Card>
              <CardHeader>
                <CardTitle>Property details</CardTitle>
                <CardDescription>Edit anything the import missed before you save.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Property address *</Label>
                  <Input
                    id="address"
                    placeholder="123 Main Street, City, State ZIP"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bedrooms">Bedrooms *</Label>
                    <Input
                      id="bedrooms"
                      type="number"
                      min="0"
                      placeholder="4"
                      value={formData.bedrooms}
                      onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
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
                      onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
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
                      onChange={(e) => setFormData({ ...formData, sqft: e.target.value })}
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
                      onChange={(e) => setFormData({ ...formData, rent: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="availableDate">Available date *</Label>
                  <Input
                    id="availableDate"
                    type="date"
                    value={formData.availableDate}
                    onChange={(e) => setFormData({ ...formData, availableDate: e.target.value })}
                    required
                  />
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
                      <div className="font-semibold text-lg mb-1">Standard</div>
                      <div className="text-sm text-mute mb-3">
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
                  <ul className="text-sm space-y-1.5 text-ink-2">
                    <li className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-ok" aria-hidden />
                      Credit, background, ID, and the packet
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-ok" aria-hidden />
                      AI income and bank verification
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
            <div className="flex gap-4">
              <Button type="submit" size="lg" className="flex-1">
                Create Listing
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
    </div>
  );
}
