"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Reveal, RevealItem, RevealStagger } from "@/components/motion/reveal";

export default function NewListingPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    address: "",
    rent: "",
    bedrooms: "",
    bathrooms: "",
    availableDate: "",
    screeningPackage: "premium",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would create the listing
    // For demo, just redirect to dashboard
    router.push("/dashboard");
  };

  return (
    <div className="space-y-6 p-5 sm:p-6">
      <Reveal>
        <Link href="/dashboard/listings">
          <Button variant="ghost" size="sm" className="group mb-4">
            <ArrowLeft className="mr-2 h-4 w-4 transition-transform duration-200 ease-out group-hover:-translate-x-1" />
            Back to properties
          </Button>
        </Link>
        <h1 className="text-[28px] font-semibold tracking-[-0.7px] text-ink">Create a listing</h1>
        <p className="text-mute mt-1">
          Address, rent, and which package applicants pay for.
        </p>
      </Reveal>

      <form onSubmit={handleSubmit} className="space-y-6">
        <RevealStagger className="space-y-6">
        <RevealItem>
        <Card>
          <CardHeader>
            <CardTitle>Property details</CardTitle>
            <CardDescription>Basic information about the rental property</CardDescription>
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bedrooms">Bedrooms *</Label>
                <Input
                  id="bedrooms"
                  type="number"
                  min="0"
                  placeholder="2"
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
                  placeholder="1.5"
                  value={formData.bathrooms}
                  onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rent">Monthly rent *</Label>
                <Input
                  id="rent"
                  type="number"
                  min="0"
                  placeholder="2000"
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
            <CardDescription>Choose the level of tenant screening</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, screeningPackage: "standard" })}
                className={`p-4 border-2 rounded-lg text-left transition-opacity duration-200 ease-out ${
                  formData.screeningPackage === "standard"
                    ? "border-primary bg-primary/5"
                    : "border-line hover:opacity-90"
                }`}
              >
                <div className="font-semibold text-lg mb-1">Standard</div>
                <div className="text-sm text-mute mb-3">$39.99 per applicant</div>
                <ul className="text-sm space-y-1 text-mute">
                  <li>✓ Credit report</li>
                  <li>✓ Criminal background</li>
                  <li>✓ Eviction history</li>
                  <li>✓ Identity verification</li>
                </ul>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, screeningPackage: "premium" })}
                className={`group p-4 border-2 rounded-lg text-left transition-opacity duration-200 ease-out ${
                  formData.screeningPackage === "premium"
                    ? "border-primary bg-primary/5"
                    : "border-line hover:opacity-90"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="font-semibold text-lg">Premium</div>
                  <Sparkles className="h-4 w-4 text-primary transition-transform duration-200 ease-out group-hover:scale-110" />
                </div>
                <div className="text-sm text-mute mb-3">$59.99 per applicant</div>
                <ul className="text-sm space-y-1 text-mute">
                  <li>✓ Everything in Standard</li>
                  <li>✓ Income verification</li>
                  <li>✓ Employment verification</li>
                  <li>✓ Landlord references</li>
                </ul>
              </button>
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
