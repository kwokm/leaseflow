"use client";

import { useEffect } from "react";
import { BedDouble, Bath, CalendarDays, Check } from "lucide-react";
import { Note, Panel, StepChrome } from "@/components/apply/step-shell";
import type { StepProps } from "@/components/apply/step-shell";
import { Button } from "@/components/ui/button";
import { formatDateOnly, formatDollars } from "@/lib/apply/format";
import { createDemoState } from "@/lib/apply/types";
import { ListingPhotoStrip } from "@/components/listings/photos";
import { useRuntimeConfig } from "@/components/config/runtime-config";
import {
  STANDARD_PACKAGE_NAME,
  STANDARD_PRICING_STORY,
  STANDARD_SCREENING_FEE,
} from "@/lib/data/mock-data";

const STANDARD_FEATURES = [
  "Experian credit report and score",
  "National criminal and eviction search",
  "Identity check",
  "AI Income Check and bank verification",
  "The packet, shared with the landlord",
  "Apply to as many homes as you want",
];

export function StepStart({ state, patch, property, embedded }: StepProps) {
  const { demo } = useRuntimeConfig();

  useEffect(() => {
    if (state.screeningPackage !== "standard") {
      patch({ screeningPackage: "standard" });
    }
  }, [patch, state.screeningPackage]);

  return (
    <StepChrome
      embedded={embedded}
      lead="Start your application for"
      tone={property.address.split(",")[0]}
    >
      {!embedded ? (
        <p className="max-w-xl text-[15px] font-medium leading-[21px] tracking-[-0.16px] text-mute">
          It takes about ten minutes. Your progress saves in this browser, so you can stop and pick it
          back up.
        </p>
      ) : null}
      {demo ? (
        <div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => patch(createDemoState(property.id, "standard"))}
          >
            Fill demo
          </Button>
          <p className="mt-1.5 text-[12px] font-medium text-mute">
            Optional: load Jane Doe&apos;s fictional details to preview the flow.
          </p>
        </div>
      ) : null}

      <Panel>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-[17px] font-semibold tracking-[-0.3px] text-ink">
              {property.address}
            </p>
            {property.photos?.length ? (
              <div className="mt-3">
                <ListingPhotoStrip photos={property.photos} alt={property.address} size="md" />
              </div>
            ) : null}
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

      <section aria-labelledby="standard-plan-title">
        <h2
          id="standard-plan-title"
          className="mb-3 text-[17px] font-semibold tracking-[-0.3px] text-ink"
        >
          Standard screening
        </h2>
        <div className="overflow-hidden rounded-lg border border-line bg-wash/40 shadow-window">
          <div className="flex flex-col p-6">
            <span className="flex items-start justify-between gap-3">
              <span>
                <span className="block text-[14px] font-medium text-mute">
                  {STANDARD_PACKAGE_NAME}
                </span>
                <span className="mt-0.5 block max-w-[42ch] text-[14px] font-medium text-mute">
                  Includes everything. Apply to as many homes as you want on this one fee.
                </span>
              </span>
              <span
                aria-hidden
                className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-ink bg-ink text-paper"
              >
                <Check className="h-3 w-3" strokeWidth={3} />
              </span>
            </span>

            <span className="num mt-4 block text-[40px] font-medium leading-[44px] tracking-[-0.4px] text-ink">
              ${STANDARD_SCREENING_FEE.toFixed(2)}
            </span>
            <span className="mt-1 block text-[13px] font-medium text-mute">
              One-time, paid by you
            </span>

            <ul className="mt-5 space-y-2 border-t border-line pt-4">
              {STANDARD_FEATURES.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-2 text-[14px] font-medium tracking-[-0.14px] text-ink-2"
                >
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-ok" aria-hidden />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <Note tone="blue">
        {STANDARD_PRICING_STORY} The Standard fee also includes background, ID, and AI Income Check
        and bank verification.
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
    </StepChrome>
  );
}
