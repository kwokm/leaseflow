"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Check, Loader2, Lock, RotateCcw, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/apply/field";
import { StepBody } from "@/components/apply/motion";
import { Note, StepHeading, SummaryRow, WindowPanel } from "@/components/apply/step-shell";
import type { StepProps } from "@/components/apply/step-shell";
import { DURATION, EASE_OUT } from "@/lib/apply/motion";
import { buildMockExperianPull, scoreBand } from "@/lib/apply/experian-mock";
import { formatDateTime } from "@/lib/apply/format";
import { cn } from "@/lib/utils";

const PULL_STAGES = [
  "Matching your file",
  "Reading tradelines",
  "Calculating your score",
];

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function useCountUp(target: number | undefined) {
  const reduced = useReducedMotion();
  const [value, setValue] = React.useState(target ?? 0);

  React.useEffect(() => {
    if (target == null) return;
    if (reduced) {
      setValue(target);
      return;
    }

    const start = Math.max(0, target - 36);
    const duration = DURATION.reveal * 1000;
    const origin = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const t = Math.min(1, (now - origin) / duration);
      const eased = 1 - (1 - t) ** 3;
      setValue(Math.round(start + (target - start) * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, reduced]);

  return value;
}

/**
 * Demo authorization chrome. It is explicitly labelled "Experian (demo)",
 * collects nothing, and no network request is made — the entire pull is
 * fabricated in `lib/apply/experian-mock.ts`.
 */
function DemoAuthorizationDialog({
  onAuthorize,
  onCancel,
}: {
  onAuthorize: () => void;
  onCancel: () => void;
}) {
  const dialogRef = React.useRef<HTMLDivElement>(null);
  const confirmRef = React.useRef<HTMLButtonElement>(null);
  const reduced = useReducedMotion();

  React.useEffect(() => {
    confirmRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCancel();
        return;
      }
      if (event.key !== "Tab") return;

      // Keep focus inside the demo dialog.
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onCancel]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-0 sm:items-center sm:p-6"
      initial={reduced ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: DURATION.ui, ease: EASE_OUT }}
    >
      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="experian-demo-title"
        className="w-full max-w-lg overflow-hidden rounded-t-lg border border-line bg-paper shadow-window sm:rounded-lg"
        initial={reduced ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        transition={{ duration: DURATION.step, ease: EASE_OUT }}
      >
        {/* Browser-style chrome, labelled as a demo throughout */}
        <div className="flex items-center gap-2 border-b border-line bg-mist px-3 py-2.5">
          <span className="flex gap-1.5" aria-hidden>
            <span className="h-2.5 w-2.5 rounded-full bg-[#E15C6B]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#F5B400]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#12A150]" />
          </span>
          <span className="ml-1 flex min-w-0 flex-1 items-center gap-1.5 rounded-md border border-line bg-paper px-2 py-1 text-[12px] font-medium text-mute">
            <Lock className="h-3 w-3 shrink-0" aria-hidden />
            <span className="truncate">experian-demo.leaseflow.local</span>
          </span>
          <span className="shrink-0 rounded-md bg-blue-soft px-2 py-1 text-[12px] font-medium text-blue">
            Experian (demo)
          </span>
        </div>

        <div className="p-5">
          <h2
            id="experian-demo-title"
            className="text-[20px] font-semibold tracking-[-0.4px] text-ink"
          >
            Authorize LeaseFlow to view your credit report
          </h2>
          <p className="mt-2 text-[14px] font-medium leading-5 tracking-[-0.14px] text-mute">
            This is simulated authorization chrome for a prototype. No credit bureau is contacted
            and no sign-in details are requested or collected.
          </p>

          <ul className="mt-4 space-y-2.5 rounded-btn border border-line bg-mist p-4">
            {[
              "A soft inquiry that never affects your score",
              "Score and summary shared with the landlord for this listing only",
              "Access ends when the application is decided",
            ].map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 text-[14px] font-medium leading-5 tracking-[-0.14px] text-ink-2"
              >
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-ok" aria-hidden />
                {item}
              </li>
            ))}
          </ul>

          <p className="mt-4 text-[13px] font-medium leading-5 text-mute">
            Experian is named here only to describe the simulated flow. This prototype is not
            affiliated with, endorsed by, or connected to any credit bureau.
          </p>

          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" size="touch" onClick={onCancel}>
              Cancel
            </Button>
            <Button ref={confirmRef} type="button" size="touch" onClick={onAuthorize}>
              Authorize (demo)
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ScoreReveal({ score }: { score: number }) {
  const displayed = useCountUp(score);
  const reduced = useReducedMotion();

  return (
    <motion.div
      className="num mt-5 text-[64px] font-semibold leading-none tracking-[-2px] text-ink"
      initial={reduced ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DURATION.reveal, ease: EASE_OUT, delay: 0.2 }}
    >
      {displayed}
    </motion.div>
  );
}

export function StepCredit({ state, patch, errors }: StepProps) {
  const experian = state.experian;
  const [stage, setStage] = React.useState(0);
  const timers = React.useRef<ReturnType<typeof setTimeout>[]>([]);

  React.useEffect(() => {
    const pending = timers.current;
    return () => {
      pending.forEach(clearTimeout);
    };
  }, []);

  const seed = `${state.personal.email}${state.personal.lastName}`.toLowerCase();

  const runPull = () => {
    patch({ experian: { status: "pulling" } });
    setStage(0);

    const finish = () => {
      patch({ experian: buildMockExperianPull(seed, new Date().toISOString()) });
    };

    if (prefersReducedMotion()) {
      setStage(PULL_STAGES.length - 1);
      finish();
      return;
    }

    timers.current.forEach(clearTimeout);
    timers.current = [
      setTimeout(() => setStage(1), 1100),
      setTimeout(() => setStage(2), 2200),
      setTimeout(finish, 3400),
    ];
  };

  const band = experian.score ? scoreBand(experian.score) : undefined;
  const pullProgress = ((stage + 1) / PULL_STAGES.length) * 100;
  const reduced = useReducedMotion();

  return (
    <StepBody>
      <StepHeading lead="Credit report." tone="Included at no extra cost." />
      <p className="max-w-xl text-[15px] font-medium leading-[21px] tracking-[-0.16px] text-mute">
        Connect your report once and it travels with this application. The landlord sees your score
        and a summary — never your full account numbers.
      </p>

      {experian.status === "connected" && experian.score ? (
        <WindowPanel label="Experian (demo)">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <span className="inline-flex items-center gap-1 text-[13px] font-medium text-ok">
                <ShieldCheck className="h-4 w-4" aria-hidden />
                Connected
              </span>
              <ScoreReveal score={experian.score} />
              <p className="mt-2 text-[15px] font-medium tracking-[-0.16px] text-mute">
                {band?.label} · {experian.scoreModel}
              </p>
            </div>

            <motion.dl
              className="w-full max-w-xs shrink-0"
              initial={reduced ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: DURATION.step, ease: EASE_OUT, delay: 0.36 }}
            >
              <SummaryRow label="On-time payments" value={`${experian.onTimePaymentRate}%`} />
              <SummaryRow label="Open accounts" value={experian.openAccounts} />
              <SummaryRow label="Oldest account" value={`${experian.oldestAccountYears} years`} />
              <SummaryRow label="Recent inquiries" value={experian.recentInquiries} />
              <SummaryRow label="Public records" value={experian.publicRecords} />
              <SummaryRow label="Pulled" value={formatDateTime(experian.pulledAt)} />
              <SummaryRow label="Cost to you" value="$0.00" />
            </motion.dl>
          </div>

          {experian.factors?.length ? (
            <motion.ul
              className="mt-5 space-y-2 border-t border-line pt-4"
              initial={reduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: DURATION.ui, ease: EASE_OUT, delay: 0.48 }}
            >
              {experian.factors.map((factor) => (
                <li
                  key={factor}
                  className="flex items-start gap-2 text-[14px] font-medium tracking-[-0.14px] text-ink-2"
                >
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-mute" aria-hidden />
                  {factor}
                </li>
              ))}
            </motion.ul>
          ) : null}

          <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-line pt-4">
            <Button
              type="button"
              variant="outline"
              size="touch"
              onClick={() => patch({ experian: { status: "idle" } })}
            >
              <RotateCcw className="h-4 w-4" aria-hidden />
              Pull again
            </Button>
            <p className="text-[13px] font-medium text-mute">
              Mock data — generated locally for this demo.
            </p>
          </div>
        </WindowPanel>
      ) : experian.status === "pulling" ? (
        <WindowPanel label="Experian (demo)">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-mute" aria-hidden />
            <p
              className="text-[15px] font-medium tracking-[-0.16px] text-ink"
              role="status"
              aria-live="polite"
            >
              Pulling your report — {PULL_STAGES[stage]}…
            </p>
          </div>
          <div className="relative mt-5 h-1 overflow-hidden rounded-full bg-line">
            <div
              className="h-full bg-ink transition-transform duration-240 ease-premium"
              style={{ transform: `translateX(-${100 - pullProgress}%)` }}
            />
          </div>
          <ol className="mt-5 space-y-3">
            {PULL_STAGES.map((label, index) => (
              <li
                key={label}
                className={cn(
                  "flex min-h-[44px] items-center gap-2.5 text-[14px] font-medium tracking-[-0.14px] transition-colors duration-200 ease-premium",
                  index < stage ? "text-ink-2" : index === stage ? "text-ink" : "text-mute-2"
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-full border transition-[background-color,border-color,color] duration-200 ease-premium",
                    index < stage
                      ? "border-ok bg-ok text-paper"
                      : index === stage
                        ? "border-ink"
                        : "border-line-2"
                  )}
                >
                  {index < stage && <Check className="h-3 w-3" strokeWidth={3} />}
                </span>
                {label}
              </li>
            ))}
          </ol>
        </WindowPanel>
      ) : (
        <WindowPanel label="Experian (demo)">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-[17px] font-semibold tracking-[-0.3px] text-ink">
                Connect your credit report
              </p>
              <p className="mt-1 text-[14px] font-medium leading-5 text-mute">
                Soft inquiry. It will not affect your score.
              </p>
            </div>
            <Button
              type="button"
              size="touch"
              className="shrink-0"
              onClick={() => patch({ experian: { status: "authorizing" } })}
            >
              Continue with Experian
            </Button>
          </div>
          <FieldError id="experian-error" message={errors.experian} />
        </WindowPanel>
      )}

      <Note tone="warn">
        Demo only. LeaseFlow never asks for your bureau username or password, and this prototype
        does not contact Experian or any other consumer reporting agency.
      </Note>

      <AnimatePresence>
        {experian.status === "authorizing" && (
          <DemoAuthorizationDialog
            onAuthorize={runPull}
            onCancel={() => patch({ experian: { status: "idle" } })}
          />
        )}
      </AnimatePresence>
    </StepBody>
  );
}
