"use client";

import * as React from "react";
import { Check, Loader2, Lock, RotateCcw, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/apply/field";
import { Note, Panel, StepHeading, SummaryRow } from "@/components/apply/step-shell";
import type { StepProps } from "@/components/apply/step-shell";
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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-0 sm:items-center sm:p-6">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="experian-demo-title"
        className="w-full max-w-lg overflow-hidden rounded-t-lg border border-line bg-paper shadow-window sm:rounded-lg"
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
      </div>
    </div>
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
      setTimeout(() => setStage(1), 800),
      setTimeout(() => setStage(2), 1600),
      setTimeout(finish, 2400),
    ];
  };

  const band = experian.score ? scoreBand(experian.score) : undefined;

  return (
    <div className="space-y-5">
      <StepHeading lead="Credit report." tone="Included at no extra cost." />
      <p className="max-w-xl text-[15px] font-medium leading-[21px] tracking-[-0.16px] text-mute">
        Connect your report once and it travels with this application. The landlord sees your score
        and a summary — never your full account numbers.
      </p>

      {experian.status === "connected" && experian.score ? (
        <Panel>
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-blue-soft px-2 py-0.5 text-[12px] font-medium text-blue">
                  Experian (demo)
                </span>
                <span className="inline-flex items-center gap-1 text-[13px] font-medium text-ok">
                  <ShieldCheck className="h-4 w-4" aria-hidden />
                  Connected
                </span>
              </div>
              <div className="num mt-4 text-[56px] font-semibold leading-none tracking-[-1.6px] text-ink">
                {experian.score}
              </div>
              <p className="mt-2 text-[15px] font-medium tracking-[-0.16px] text-mute">
                {band?.label} · {experian.scoreModel}
              </p>
            </div>

            <dl className="w-full max-w-xs shrink-0">
              <SummaryRow label="On-time payments" value={`${experian.onTimePaymentRate}%`} />
              <SummaryRow label="Open accounts" value={experian.openAccounts} />
              <SummaryRow label="Oldest account" value={`${experian.oldestAccountYears} years`} />
              <SummaryRow label="Recent inquiries" value={experian.recentInquiries} />
              <SummaryRow label="Public records" value={experian.publicRecords} />
              <SummaryRow label="Pulled" value={formatDateTime(experian.pulledAt)} />
              <SummaryRow label="Cost to you" value="$0.00" />
            </dl>
          </div>

          {experian.factors?.length ? (
            <ul className="mt-5 space-y-2 border-t border-line pt-4">
              {experian.factors.map((factor) => (
                <li
                  key={factor}
                  className="flex items-start gap-2 text-[14px] font-medium tracking-[-0.14px] text-ink-2"
                >
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-mute" aria-hidden />
                  {factor}
                </li>
              ))}
            </ul>
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
        </Panel>
      ) : experian.status === "pulling" ? (
        <Panel>
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
          <ol className="mt-4 space-y-2">
            {PULL_STAGES.map((label, index) => (
              <li
                key={label}
                className={cn(
                  "flex items-center gap-2 text-[14px] font-medium tracking-[-0.14px]",
                  index < stage ? "text-ink-2" : index === stage ? "text-ink" : "text-mute-2"
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-full border",
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
        </Panel>
      ) : (
        <Panel>
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
        </Panel>
      )}

      <Note tone="warn">
        Demo only. LeaseFlow never asks for your bureau username or password, and this prototype
        does not contact Experian or any other consumer reporting agency.
      </Note>

      {experian.status === "authorizing" && (
        <DemoAuthorizationDialog
          onAuthorize={runPull}
          onCancel={() => patch({ experian: { status: "idle" } })}
        />
      )}
    </div>
  );
}
