"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Check, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/apply/field";
import { StepBody } from "@/components/apply/motion";
import { Note, StepHeading, SummaryRow, WindowPanel } from "@/components/apply/step-shell";
import type { StepProps } from "@/components/apply/step-shell";
import { useRuntimeConfig } from "@/components/config/runtime-config";
import { DURATION, EASE_OUT } from "@/lib/apply/motion";
import { buildMockExperianPull, scoreBand } from "@/lib/apply/experian-mock";
import { formatDateTime } from "@/lib/apply/format";
import {
  CONNECT_BULLETS,
  CONNECT_INQUIRY_LINE,
  FCRA_PLACEHOLDER_NOTICE,
} from "@/lib/legal/fcra";

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
 * Experian Connect consent. The applicant authenticates with Experian and
 * Experian shares the report with the landlord — Leaseproof never asks for
 * bureau credentials and never handles the report itself.
 */
function ConnectDialog({
  onAuthorize,
  onCancel,
  busy,
}: {
  onAuthorize: () => void;
  onCancel: () => void;
  busy: boolean;
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

      // Keep focus inside the dialog.
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
        aria-labelledby="experian-connect-title"
        className="w-full max-w-lg overflow-hidden rounded-t-lg border border-line bg-paper shadow-window sm:rounded-lg"
        initial={reduced ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        transition={{ duration: DURATION.step, ease: EASE_OUT }}
      >
        <div className="card-head">
          <span className="card-head-title">Experian Connect</span>
          <span className="card-head-meta">Soft inquiry</span>
        </div>

        <div className="p-5">
          <h2
            id="experian-connect-title"
            className="text-[20px] font-semibold tracking-[-0.4px] text-ink"
          >
            Share your credit report with this landlord
          </h2>
          <p className="mt-2 text-[14px] font-medium leading-5 tracking-[-0.14px] text-mute">
            Experian verifies your identity and releases the report. Leaseproof never asks for your
            Experian username or password.
          </p>

          <ul className="mt-4 space-y-2.5 rounded-btn border border-line bg-mist p-4">
            {CONNECT_BULLETS.map((item) => (
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
            {FCRA_PLACEHOLDER_NOTICE}
          </p>

          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" size="touch" onClick={onCancel} disabled={busy}>
              Cancel
            </Button>
            <Button ref={confirmRef} type="button" size="touch" onClick={onAuthorize} disabled={busy}>
              {busy ? "Authorizing…" : "Authorize share"}
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
  const config = useRuntimeConfig();
  const [busy, setBusy] = React.useState(false);
  const [failure, setFailure] = React.useState<string | null>(null);
  const reduced = useReducedMotion();

  const authorize = async () => {
    setBusy(true);
    setFailure(null);

    try {
      const response = await fetch("/api/screening/authorize", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          listingId: state.listingId,
          firstName: state.personal.firstName,
          lastName: state.personal.lastName,
          email: state.personal.email,
        }),
      });

      const payload = (await response.json().catch(() => ({}))) as {
        shareReference?: string;
        previewAvailable?: boolean;
        error?: string;
      };

      if (!response.ok || !payload.shareReference) {
        setFailure(payload.error ?? "Could not reach Experian Connect. Try again.");
        patch({ experian: { status: "idle" } });
        return;
      }

      // Demo deployments reveal the fabricated summary right away. Everywhere
      // else the share stays authorized and the report is only requested once
      // the fee is captured.
      if (payload.previewAvailable) {
        patch({
          experian: {
            ...buildMockExperianPull(
              `${state.personal.email}${state.personal.lastName}`.toLowerCase(),
              new Date().toISOString()
            ),
            shareReference: payload.shareReference,
          },
        });
        return;
      }

      patch({
        experian: { status: "authorized", shareReference: payload.shareReference },
      });
    } catch {
      setFailure("Could not reach Experian Connect. Try again.");
      patch({ experian: { status: "idle" } });
    } finally {
      setBusy(false);
    }
  };

  const band = experian.score ? scoreBand(experian.score) : undefined;

  return (
    <StepBody>
      <StepHeading lead="Credit report." tone="Included in the $24.99 Standard fee." />
      <p className="max-w-xl text-[15px] font-medium leading-[21px] tracking-[-0.16px] text-mute">
        Authorize once and your report travels with this application. The landlord sees your score
        and a summary — never your account numbers.
      </p>

      {experian.status === "connected" && experian.score ? (
        <WindowPanel label="Experian Connect">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <span className="inline-flex items-center gap-1 text-[13px] font-medium text-ok">
                <ShieldCheck className="h-4 w-4" aria-hidden />
                Shared
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
              <SummaryRow label="Shared" value={formatDateTime(experian.pulledAt)} />
              <SummaryRow label="Extra Experian fee" value="$0.00" />
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

          {config.demo ? (
            <p className="mt-5 border-t border-line pt-4 text-[13px] font-medium text-mute">
              Demo summary — generated locally, no consumer reporting agency was contacted.
            </p>
          ) : null}
        </WindowPanel>
      ) : experian.status === "authorized" ? (
        <WindowPanel label="Experian Connect">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-ok" aria-hidden />
            <div className="min-w-0">
              <p className="text-[17px] font-semibold tracking-[-0.3px] text-ink">
                Share authorized
              </p>
              <p className="mt-1 text-[14px] font-medium leading-5 text-mute">
                Your report is requested after you pay the $24.99 screening fee on the next step —
                not before. {CONNECT_INQUIRY_LINE}
              </p>
            </div>
          </div>
          <dl className="mt-4 border-t border-line pt-4">
            <SummaryRow label="Provider" value="Experian Connect" />
            <SummaryRow label="Inquiry" value="Soft" />
            <SummaryRow label="Extra Experian fee" value="$0.00" />
          </dl>
        </WindowPanel>
      ) : experian.status === "pulling" ? (
        <WindowPanel label="Experian Connect">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-mute" aria-hidden />
            <p
              className="text-[15px] font-medium tracking-[-0.16px] text-ink"
              role="status"
              aria-live="polite"
            >
              Contacting Experian Connect…
            </p>
          </div>
        </WindowPanel>
      ) : (
        <WindowPanel label="Experian Connect">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-[17px] font-semibold tracking-[-0.3px] text-ink">
                Share your credit report
              </p>
              <p className="mt-1 text-[14px] font-medium leading-5 text-mute">
                {CONNECT_INQUIRY_LINE} You pay before anything is requested.
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
          <FieldError id="experian-error" message={failure ?? errors.experian} />
        </WindowPanel>
      )}

      <Note tone="warn">
        {FCRA_PLACEHOLDER_NOTICE} Leaseproof never asks for your Experian username or password.
      </Note>

      <AnimatePresence>
        {experian.status === "authorizing" && (
          <ConnectDialog
            busy={busy}
            onAuthorize={authorize}
            onCancel={() => patch({ experian: { status: "idle" } })}
          />
        )}
      </AnimatePresence>
    </StepBody>
  );
}
