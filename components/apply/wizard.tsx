"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Lock } from "lucide-react";
import { BrandMark, BrandWord } from "@/components/brand";
import { PacketWindow } from "@/components/desk/packet-window";
import { Reveal } from "@/components/motion/reveal";
import { SpatialMount, SpatialOrigin } from "@/components/motion/spatial";
import { PageWash } from "@/components/page-wash";
import { Button } from "@/components/ui/button";
import { shortAddress } from "@/lib/desk/display";
import { StageYou } from "@/components/apply/stage-you";
import { StageProof } from "@/components/apply/stage-proof";
import { StepCredit } from "@/components/apply/step-credit";
import { StepReview } from "@/components/apply/step-review";
import { StepDone } from "@/components/apply/step-done";
import { StepTransition } from "@/components/apply/motion";
import type { StepProps } from "@/components/apply/step-shell";
import { clearDraft, loadDraft, saveDraft, saveSubmission } from "@/lib/apply/storage";
import { localApplicantId } from "@/lib/apply/to-packet";
import {
  APPLY_STEP,
  APPLY_STEPPER,
  TOTAL_STEPS,
  createInitialState,
  type ApplyState,
} from "@/lib/apply/types";
import type { StepErrors } from "@/lib/apply/validate";
import { firstErrorKey, validateStep } from "@/lib/apply/validate";
import type { Property } from "@/lib/data/mock-data";
import { cn } from "@/lib/utils";

function newConfirmationId(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let i = 0; i < 6; i += 1) {
    suffix += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `LP-${suffix}`;
}

const STEP_COMPONENTS: Record<number, (props: StepProps) => React.ReactElement> = {
  [APPLY_STEP.you]: StageYou,
  [APPLY_STEP.proof]: StageProof,
  [APPLY_STEP.credit]: StepCredit,
  [APPLY_STEP.pay]: StepReview,
  [APPLY_STEP.done]: StepDone,
};

export function ApplyWizard({ property }: { property: Property }) {
  const [state, setState] = React.useState<ApplyState>(() =>
    createInitialState(property.id, property.screeningPackage)
  );
  const [errors, setErrors] = React.useState<StepErrors>({});
  const [hydrated, setHydrated] = React.useState(false);
  const [direction, setDirection] = React.useState(1);
  const headingRef = React.useRef<HTMLDivElement>(null);

  // Draft lives in localStorage; load it once the component is on the client.
  React.useEffect(() => {
    setState(loadDraft(property.id, property.screeningPackage));
    setHydrated(true);
  }, [property.id, property.screeningPackage]);

  React.useEffect(() => {
    if (hydrated) saveDraft(state);
  }, [state, hydrated]);

  const patch = React.useCallback((partial: Partial<ApplyState>) => {
    setState((current) => ({ ...current, ...partial }));
  }, []);

  const step = state.step;
  const StepComponent = STEP_COMPONENTS[step];

  const moveTo = React.useCallback((next: number) => {
    setErrors({});
    setDirection(next >= step ? 1 : -1);
    setState((current) => ({
      ...current,
      step: next,
      furthestStep: Math.max(current.furthestStep, next),
    }));
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  }, [step]);

  // Move focus to the step region so keyboard and screen-reader users land in
  // the new content rather than back at the top of the document.
  React.useEffect(() => {
    if (hydrated) headingRef.current?.focus();
  }, [step, hydrated]);

  const submit = () => {
    const now = new Date().toISOString();
    const confirmationId = newConfirmationId();
    const submitted: ApplyState = {
      ...state,
      submittedAt: now,
      confirmationId,
      consent: { ...state.consent, acceptedAt: now },
      step: APPLY_STEP.done,
      furthestStep: APPLY_STEP.done,
    };

    setDirection(1);
    setState(submitted);
    saveSubmission(submitted);
    clearDraft(property.id);
    setErrors({});
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "auto" });
  };

  const goNext = () => {
    const nextErrors = validateStep(step, state);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      const first = firstErrorKey(nextErrors);
      if (first) {
        window.requestAnimationFrame(() => document.getElementById(first)?.focus());
      }
      return;
    }

    if (step === APPLY_STEP.pay) {
      submit();
      return;
    }
    moveTo(Math.min(step + 1, TOTAL_STEPS));
  };

  const goTo = (target: number) => {
    if (target < 1 || target > TOTAL_STEPS) return;
    if (target > state.furthestStep) return;
    moveTo(target);
  };

  const errorCount = Object.keys(errors).length;

  return (
    <div className="relative min-h-screen overflow-hidden bg-white print:bg-white">
      <SpatialOrigin>
        <PageWash />
      </SpatialOrigin>

      <a href="#apply-step" className="skip-link">
        Skip to the current step
      </a>

      <header className="relative z-40 bg-white print:hidden">
        <div className="relative z-10 mx-auto flex h-16 max-w-shell items-center gap-4 px-5 sm:px-8">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2.5 text-ink rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            <BrandMark />
            <BrandWord />
          </Link>

          <p className="ml-auto hidden items-center gap-1.5 text-[13px] font-medium text-mute sm:flex">
            <Lock className="h-3.5 w-3.5" aria-hidden />
            Saved in this browser
          </p>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-shell px-5 py-8 sm:px-8 lg:py-12">
        <SpatialMount>
          <PacketWindow
            title={`Application packet • ${shortAddress(property.address)}`}
            meta="Desk • 3 files"
          >
          <div className="desk apply-desk">
        <nav aria-label="Application steps" className="desk-rail print:hidden">
          {APPLY_STEPPER.map((entry) => {
            const current = entry.id === step || (step === APPLY_STEP.done && entry.id === APPLY_STEP.pay);

            return (
              <button
                key={entry.id}
                type="button"
                aria-current={current ? "step" : undefined}
                disabled={entry.id > state.furthestStep}
                onClick={() => goTo(entry.id)}
                className={cn(
                  "rail-item",
                  current && "is-active",
                  entry.id > state.furthestStep && "cursor-not-allowed opacity-45"
                )}
              >
                {entry.name}
              </button>
            );
          })}
        </nav>

        <main id="apply-step" className="min-w-0 px-5 py-6 sm:px-8 sm:py-8">
          <div ref={headingRef} tabIndex={-1} className="outline-none">
            {errorCount > 0 && (
              <div
                role="alert"
                className="mb-5 rounded-btn border border-no bg-no-bg px-4 py-3 text-[14px] font-medium leading-5 tracking-[-0.14px] text-no"
              >
                {errorCount === 1
                  ? "One field needs your attention before you continue."
                  : `${errorCount} fields need your attention before you continue.`}
              </div>
            )}

            <StepTransition step={step} direction={direction}>
              <StepComponent
                state={state}
                patch={patch}
                errors={errors}
                property={property}
                goTo={goTo}
              />
            </StepTransition>
          </div>

          <div className="sticky bottom-4 z-20 mt-8 print:hidden">
            <div className="flex flex-col-reverse gap-3 rounded-lg border border-line bg-paper/80 px-4 py-3 shadow-mini backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
              {step > 1 ? (
                <Button type="button" variant="outline" size="touch" onClick={() => moveTo(step - 1)}>
                  <ArrowLeft className="h-4 w-4" aria-hidden />
                  Back
                </Button>
              ) : (
                <span className="hidden sm:block" />
              )}

              {step < APPLY_STEP.done ? (
                <Button type="button" size="touch" onClick={goNext} className="sm:min-w-[168px]">
                  {step === APPLY_STEP.pay ? "Pay and submit" : "Continue"}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Button>
              ) : (
                <Button asChild size="touch" className="sm:min-w-[168px]">
                  <Link href={`/packet/${localApplicantId(state.confirmationId ?? "")}`}>
                    Open renter packet
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </main>
          </div>
          </PacketWindow>
        </SpatialMount>
      </div>

      <footer className="relative z-10 print:hidden">
        <Reveal className="mx-auto flex max-w-shell flex-wrap items-center justify-between gap-3 px-5 py-6 text-[13px] font-medium text-mute sm:px-8">
          <p>Demo prototype · mock data only, no consumer reporting agency is used.</p>
          <Link href="/" className="text-ink-2 transition-colors duration-240 ease-premium hover:text-ink">
            Back to Leaseproof
          </Link>
        </Reveal>
      </footer>
    </div>
  );
}
