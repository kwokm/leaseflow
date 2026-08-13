"use client";

import { BedDouble, Bath, CalendarDays, Check } from "lucide-react";
import { Note, Panel, StepHeading } from "@/components/apply/step-shell";
import type { StepProps } from "@/components/apply/step-shell";
import { formatDateOnly, formatDollars } from "@/lib/apply/format";
import type { ScreeningPackage } from "@/lib/data/mock-data";
import { cn } from "@/lib/utils";

const PACKAGES: {
  id: ScreeningPackage;
  name: string;
  price: number;
  blurb: string;
  features: string[];
}[] = [
  {
    id: "standard",
    name: "Standard",
    price: 39.99,
    blurb: "Everything most landlords ask for.",
    features: [
      "Credit report and score",
      "National criminal records search",
      "Eviction records",
      "Identity check",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    price: 59.99,
    blurb: "Adds income and employment verification.",
    features: [
      "Everything in Standard",
      "Income verified against pay stubs",
      "Bank statement review",
      "Landlord reference outreach",
    ],
  },
];

export function StepStart({ state, patch, property }: StepProps) {
  return (
    <div className="space-y-5">
      <StepHeading lead="Start your application for" tone={property.address.split(",")[0]} />
      <p className="max-w-xl text-[15px] font-medium leading-[21px] tracking-[-0.16px] text-mute">
        It takes about ten minutes. Your progress saves in this browser, so you can stop and pick it
        back up.
      </p>

      <Panel>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-[17px] font-semibold tracking-[-0.3px] text-ink">
              {property.address}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[14px] font-medium text-mute">
              <span className="inline-flex items-center gap-1.5">
                <BedDouble className="h-4 w-4" aria-hidden />
                {property.bedrooms} bed
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Bath className="h-4 w-4" aria-hidden />
                {property.bathrooms} bath
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4" aria-hidden />
                Available {formatDateOnly(property.availableDate)}
              </span>
            </div>
          </div>
          <div className="shrink-0 sm:text-right">
            <div className="num text-[24px] font-semibold tracking-[-0.5px] text-ink">
              {formatDollars(property.rent)}
            </div>
            <div className="text-[13px] font-medium text-mute">per month</div>
          </div>
        </div>
      </Panel>

      <fieldset>
        <legend className="mb-3 text-[17px] font-semibold tracking-[-0.3px] text-ink">
          Choose a screening package
        </legend>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {PACKAGES.map((pkg) => {
            const selected = state.screeningPackage === pkg.id;
            return (
              <label
                key={pkg.id}
                className={cn(
                  // The radio itself is visually hidden, so the card carries the focus ring.
                  "relative flex cursor-pointer flex-col rounded-lg border bg-paper p-5 transition-colors",
                  "focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ink",
                  selected ? "border-ink shadow-mini" : "border-line hover:border-line-2"
                )}
              >
                <input
                  type="radio"
                  name="screening-package"
                  value={pkg.id}
                  checked={selected}
                  onChange={() => patch({ screeningPackage: pkg.id })}
                  className="sr-only"
                />
                <span className="flex items-start justify-between gap-3">
                  <span>
                    <span className="block text-[17px] font-semibold tracking-[-0.3px] text-ink">
                      {pkg.name}
                    </span>
                    <span className="mt-0.5 block text-[14px] font-medium text-mute">
                      {pkg.blurb}
                    </span>
                  </span>
                  <span
                    aria-hidden
                    className={cn(
                      "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                      selected ? "border-ink bg-ink text-paper" : "border-line-2 bg-paper"
                    )}
                  >
                    {selected && <Check className="h-3 w-3" strokeWidth={3} />}
                  </span>
                </span>

                <span className="num mt-4 block text-[32px] font-semibold leading-none tracking-[-0.9px] text-ink">
                  ${pkg.price.toFixed(2)}
                </span>
                <span className="mt-1 block text-[13px] font-medium text-mute">
                  One-time, paid by you
                </span>

                <ul className="mt-4 space-y-2 border-t border-line pt-4">
                  {pkg.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-[14px] font-medium tracking-[-0.14px] text-ink-2"
                    >
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-ok" aria-hidden />
                      {feature}
                    </li>
                  ))}
                </ul>
              </label>
            );
          })}
        </div>
      </fieldset>

      <Note tone="blue">
        Your credit report is included at no extra cost. You&apos;ll connect it through the Experian
        (demo) step, and the $0.00 line stays on your receipt.
      </Note>

      <Panel title="What you'll need" description="Have these ready before you start.">
        <ul className="space-y-2 text-[14px] font-medium tracking-[-0.14px] text-ink-2">
          {[
            "A photo ID — front and back",
            "Two recent pay stubs",
            "One to three bank statements",
            "About ten minutes",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-mute" aria-hidden />
              {item}
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
