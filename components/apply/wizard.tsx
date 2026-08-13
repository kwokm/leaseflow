"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { StepStart } from "@/components/apply/step-start";
import { StepYou } from "@/components/apply/step-you";
import { StepBank, StepIncome, StepPhotoId } from "@/components/apply/step-uploads";
import { StepCredit } from "@/components/apply/step-credit";
import { StepHousehold } from "@/components/apply/step-household";
import { StepReview } from "@/components/apply/step-review";
import { StepDone } from "@/components/apply/step-done";
import type { StepProps } from "@/components/apply/step-shell";
import { clearDraft, loadDraft, saveDraft, saveSubmission } from "@/lib/apply/storage";
import { APPLY_STEPS, TOTAL_STEPS, createInitialState, type ApplyState } from "@/lib/apply/types";
import { validateStep, type StepErrors } from "@/lib/apply/validate";
import type { Property } from "@/lib/data/mock-data";
import { cn } from "@/lib/utils";

function newConfirmationId(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let i = 0; i < 6; i += 1) {
    suffix += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `LF-${suffix}`;
}

const STEP_COMPONENTS: Record<number, (props: StepProps) => React.ReactElement> = {
  1: StepStart,
  2: StepYou,
  3: StepPhotoId,
  4: StepIncome,
  5: StepBank,
  6: StepCredit,
  7: StepHousehold,
  8: StepReview,
  9: StepDone,
};

export function ApplyWizard({ property }: { property: Property }) {
  const [state, setState] = React.useState<ApplyState>(() =>
    createInitialState(property.id, property.screeningPackage)
  );
  const [errors, setErrors] = React.useState<StepErrors>({});
  const [hydrated, setHydrated] = React.useState(false);
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
  const definition = APPLY_STEPS[step - 1];
  const StepComponent = STEP_COMPONENTS[step];

  const moveTo = React.useCallback((next: number) => {
    setErrors({});
    setState((current) => ({
      ...current,
      step: next,
      furthestStep: Math.max(current.furthestStep, next),
    }));
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  }, []);

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
      step: 9,
      furthestStep: 9,
    };

    setState(submitted);
    saveSubmission(submitted);
    clearDraft(property.id);
    setErrors({});
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "auto" });
  };

  const goNext = () => {
    const found = validateStep(step, state);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      headingRef.current?.focus();
      return;
    }
    if (step === 8) {
      submit();
      return;
    }
    moveTo(Math.min(step + 1, TOTAL_STEPS));
  };

  const goTo = (target: number) => {
    if (target <= state.furthestStep) moveTo(target);
  };

  const progress = Math.round((step / TOTAL_STEPS) * 100);
  const errorCount = Object.keys(errors).length;

  return (
    <div className="min-h-screen bg-paper">
      <a href="#apply-step" className="skip-link">
        Skip to the current step
      </a>

      <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur print:hidden">
        <div className="mx-auto flex h-16 max-w-shell items-center gap-4 px-5 sm:px-8">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2 rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            <span
              aria-hidden
              className="flex h-6 w-6 items-center justify-center rounded-[7px] bg-fill text-[13px] font-semibold text-fill-text"
            >
              L
            </span>
            <span className="text-[16px] font-semibold tracking-[-0.64px] text-ink">LeaseFlow</span>
          </Link>

          <p className="ml-auto hidden items-center gap-1.5 text-[13px] font-medium text-mute sm:flex">
            <Lock className="h-3.5 w-3.5" aria-hidden />
            Saved in this browser
          </p>
        </div>

        <div className="border-t border-line">
          <div className="mx-auto max-w-shell px-5 py-3 sm:px-8">
            <div className="flex items-baseline justify-between gap-4">
              <p className="text-[13px] font-medium tracking-[-0.13px] text-ink-2">
                <span className="num">
                  Step {step} of {TOTAL_STEPS}
                </span>
                <span className="tone"> · {definition.name}</span>
              </p>
              <p className="num text-[13px] font-medium text-mute">{progress}%</p>
            </div>
            <Progress
              value={progress}
              className="mt-2"
              aria-label={`Application progress: step ${step} of ${TOTAL_STEPS}`}
            />
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-shell gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[212px_minmax(0,1fr)] lg:py-12">
        {/* Step rail — desktop only; the progress bar covers small screens. */}
        <nav aria-label="Application steps" className="hidden lg:block print:hidden">
          <ol className="sticky top-36 space-y-0.5">
            {APPLY_STEPS.map((entry) => {
              const done = entry.id < step;
              const current = entry.id === step;
              const reachable = entry.id <= state.furthestStep;

              return (
                <li key={entry.id}>
                  <button
                    type="button"
                    disabled={!reachable || state.step === 9}
                    aria-current={current ? "step" : undefined}
                    onClick={() => goTo(entry.id)}
                    className={cn(
                      "flex min-h-[44px] w-full items-center gap-2.5 rounded-md px-2.5 text-left text-[13px] font-medium tracking-[-0.13px] transition-colors",
                      current ? "bg-rail text-ink" : "text-mute",
                      reachable && !current && "hover:bg-mist hover:text-ink",
                      !reachable && "cursor-default opacity-60"
                    )}
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "num flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[11px]",
                        done && "border-ink bg-ink text-paper",
                        current && !done && "border-ink text-ink",
                        !done && !current && "border-line-2 text-mute-2"
                      )}
                    >
                      {done ? <Check className="h-3 w-3" strokeWidth={3} /> : entry.id}
                    </span>
                    {entry.name}
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>

        <main id="apply-step" className="min-w-0">
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

            <StepComponent
              state={state}
              patch={patch}
              errors={errors}
              property={property}
              goTo={goTo}
            />
          </div>

          {step < 9 && (
            <div className="mt-8 flex flex-col-reverse gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between print:hidden">
              {step > 1 ? (
                <Button type="button" variant="outline" size="touch" onClick={() => moveTo(step - 1)}>
                  <ArrowLeft className="h-4 w-4" aria-hidden />
                  Back
                </Button>
              ) : (
                <span className="hidden sm:block" />
              )}

              <Button type="button" size="touch" onClick={goNext} className="sm:min-w-[168px]">
                {step === 8 ? "Pay and submit" : "Continue"}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Button>
            </div>
          )}
        </main>
      </div>

      <footer className="border-t border-line print:hidden">
        <div className="mx-auto flex max-w-shell flex-wrap items-center justify-between gap-3 px-5 py-6 text-[13px] font-medium text-mute sm:px-8">
          <p>Demo prototype · mock data only, no consumer reporting agency is used.</p>
          <Link href="/" className="text-ink-2 hover:text-ink">
            Back to LeaseFlow
          </Link>
        </div>
      </footer>
    </div>
  );
}
