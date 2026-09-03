"use client";

import * as React from "react";
import { motion, useReducedMotion } from "motion/react";
import { Check, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, FieldError } from "@/components/apply/field";
import { CreditConsentReceipt } from "@/components/apply/credit-consent-receipt";
import { StepBody } from "@/components/apply/motion";
import { Note, SummaryRow, WindowPanel } from "@/components/apply/step-shell";
import type { StepProps } from "@/components/apply/step-shell";
import { useRuntimeConfig } from "@/components/config/runtime-config";
import { DURATION, EASE_OUT } from "@/lib/apply/motion";
import { buildMockExperianPull, scoreBand } from "@/lib/apply/experian-mock";
import { formatDateTime } from "@/lib/apply/format";
import type { ConsentInfo } from "@/lib/apply/types";
import {
  CONSENT_AUTH_CHECKBOX,
  CONSENT_USE_CHECKBOX,
  CREDIT_CA_NOTICE,
  CREDIT_DECLINE_MESSAGE,
  CREDIT_DISCLOSURE_BODY,
  CREDIT_DISCLOSURE_HEADING,
  CREDIT_ERROR_EXPERIAN_UNAVAILABLE,
  CREDIT_ERROR_KBA_FAILED,
  CREDIT_HOW_THIS_WORKS,
  CREDIT_HOW_THIS_WORKS_HELPER,
  CREDIT_PRIMARY_ACTION,
  CREDIT_SECONDARY_ACTION,
  CREDIT_STEP_DECK,
  CREDIT_STEP_TITLE,
  CREDIT_SUCCESS_MESSAGE,
  FCRA_PACK_VERSION,
  creditConsentReady,
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

function patchConsent(current: ConsentInfo, partial: Partial<ConsentInfo>): ConsentInfo {
  const next = { ...current, ...partial };
  if (partial.typedFullName !== undefined) {
    next.signature = partial.typedFullName;
  }
  return next;
}

export function StepCredit({ state, patch, errors }: StepProps) {
  const experian = state.experian;
  const config = useRuntimeConfig();
  const [busy, setBusy] = React.useState(false);
  const [failure, setFailure] = React.useState<string | null>(null);
  const reduced = useReducedMotion();
  const ready = creditConsentReady(state.consent);
  const shared = experian.status === "connected" || experian.status === "authorized";

  const setConsent = (partial: Partial<ConsentInfo>) => {
    patch({ consent: patchConsent(state.consent, partial) });
  };

  const authorize = async () => {
    if (!ready || busy) return;

    setBusy(true);
    setFailure(null);
    setConsent({ declined: false });
    patch({ experian: { ...state.experian, status: "pulling" } });

    try {
      const response = await fetch("/api/screening/authorize", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          listingId: state.listingId,
          applicationId: state.applicationId,
          consentId: state.consent.consentId,
          firstName: state.personal.firstName,
          lastName: state.personal.lastName,
          email: state.personal.email,
          phone: state.personal.phone,
          checkboxAuth: state.consent.checkboxAuth,
          checkboxUse: state.consent.checkboxUse,
          typedFullName: state.consent.typedFullName,
          locale: state.consent.locale ?? "en-US",
        }),
      });

      const payload = (await response.json().catch(() => ({}))) as {
        shareReference?: string;
        previewAvailable?: boolean;
        error?: string;
        consent?: {
          consentId: string;
          applicationId: string;
          consentedAt: string;
          copyVersion: string;
          copySha256: string;
          disclosureText: string;
          recipientName: string;
          locale: string;
          typedFullName: string;
        };
      };

      if (payload.consent) {
        patch({
          applicationId: payload.consent.applicationId,
          consent: patchConsent(state.consent, {
            consentId: payload.consent.consentId,
            acceptedAt: payload.consent.consentedAt,
            copyVersion: payload.consent.copyVersion,
            copySha256: payload.consent.copySha256,
            disclosureText: payload.consent.disclosureText,
            recipientName: payload.consent.recipientName,
            locale: payload.consent.locale,
            typedFullName: payload.consent.typedFullName,
            declined: false,
          }),
        });
      }

      if (!response.ok || !payload.shareReference) {
        const message =
          payload.error === CREDIT_ERROR_KBA_FAILED
            ? CREDIT_ERROR_KBA_FAILED
            : (payload.error ?? CREDIT_ERROR_EXPERIAN_UNAVAILABLE);
        setFailure(message);
        patch({ experian: { status: "idle", shareReference: undefined } });
        return;
      }

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
      setFailure(CREDIT_ERROR_EXPERIAN_UNAVAILABLE);
      patch({ experian: { status: "idle" } });
    } finally {
      setBusy(false);
    }
  };

  const band = experian.score ? scoreBand(experian.score) : undefined;
  const showForm = !shared;

  return (
    <StepBody>
      <h1 className="text-[28px] font-semibold leading-[1.1] tracking-[-0.7px] text-ink sm:text-[34px] sm:tracking-[-0.9px]">
        {CREDIT_STEP_TITLE}
      </h1>
      <p className="max-w-xl text-[15px] font-medium leading-[21px] tracking-[-0.16px] text-mute">
        {CREDIT_STEP_DECK}
      </p>

      <WindowPanel label="How this works">
        <ol className="space-y-2.5">
          {CREDIT_HOW_THIS_WORKS.map((item, index) => (
            <li
              key={item}
              className="flex items-start gap-3 text-[14px] font-medium leading-5 tracking-[-0.14px] text-ink-2"
            >
              <span className="num mt-px w-5 shrink-0 text-mute">{index + 1}.</span>
              <span>{item}</span>
            </li>
          ))}
        </ol>
        <p className="mt-4 text-[13px] font-medium leading-5 text-mute">
          {CREDIT_HOW_THIS_WORKS_HELPER}
        </p>
      </WindowPanel>

      {showForm ? (
        <WindowPanel label={CREDIT_DISCLOSURE_HEADING}>
          <div className="space-y-3 text-[13px] font-medium leading-5 text-mute">
            {CREDIT_DISCLOSURE_BODY.split("\n\n").map((paragraph) => (
              <p key={paragraph.slice(0, 48)} className="whitespace-pre-wrap">
                {paragraph}
              </p>
            ))}
          </div>
          <p className="mt-4 text-[13px] font-medium leading-5 text-ink-2">{CREDIT_CA_NOTICE}</p>

          <div className="mt-5 space-y-1 border-t border-line pt-4">
            <Checkbox
              id="checkboxAuth"
              checked={state.consent.checkboxAuth}
              error={errors.checkboxAuth}
              onChange={(checked) => setConsent({ checkboxAuth: checked, declined: false })}
            >
              {CONSENT_AUTH_CHECKBOX}
            </Checkbox>
            <Checkbox
              id="checkboxUse"
              checked={state.consent.checkboxUse}
              error={errors.checkboxUse}
              onChange={(checked) => setConsent({ checkboxUse: checked, declined: false })}
            >
              {CONSENT_USE_CHECKBOX}
            </Checkbox>
          </div>

          <div className="mt-4 max-w-sm">
            <Field
              id="typedFullName"
              label="Full name"
              placeholder="Type your full name"
              autoComplete="name"
              value={state.consent.typedFullName}
              error={errors.typedFullName}
              onChange={(event) =>
                setConsent({ typedFullName: event.target.value, declined: false })
              }
            />
          </div>

          {state.consent.declined ? (
            <Note tone="warn">{CREDIT_DECLINE_MESSAGE}</Note>
          ) : null}

          <FieldError id="experian-error" message={failure ?? errors.experian} />

          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              size="touch"
              disabled={busy}
              onClick={() => {
                setFailure(null);
                setConsent({ declined: true });
                patch({ experian: { status: "idle" } });
              }}
            >
              {CREDIT_SECONDARY_ACTION}
            </Button>
            <Button
              type="button"
              size="touch"
              disabled={!ready || busy}
              onClick={() => void authorize()}
            >
              {busy ? "Contacting Experian…" : CREDIT_PRIMARY_ACTION}
            </Button>
          </div>
        </WindowPanel>
      ) : experian.status === "connected" && experian.score ? (
        <WindowPanel label="Experian">
          <p className="text-[14px] font-medium leading-5 text-ink-2">{CREDIT_SUCCESS_MESSAGE}</p>
          <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
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
              Demo summary — generated locally. Experian was not contacted.
            </p>
          ) : null}
        </WindowPanel>
      ) : experian.status === "authorized" ? (
        <WindowPanel label="Experian">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-mute" aria-hidden />
            <div className="min-w-0">
              <p className="text-[17px] font-semibold tracking-[-0.3px] text-ink">
                Authorization saved
              </p>
              <p className="mt-1 text-[14px] font-medium leading-5 text-mute">
                Your consent is archived. Experian Connect is not live on this
                private beta, so nothing was shared with the landlord.
              </p>
            </div>
          </div>
        </WindowPanel>
      ) : experian.status === "pulling" ? (
        <WindowPanel label="Experian">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-mute" aria-hidden />
            <p
              className="text-[15px] font-medium tracking-[-0.16px] text-ink"
              role="status"
              aria-live="polite"
            >
              Contacting Experian…
            </p>
          </div>
        </WindowPanel>
      ) : null}

      {state.consent.consentId ? <CreditConsentReceipt consent={state.consent} /> : null}

      <p className="text-[12px] font-medium text-mute">Copy version {FCRA_PACK_VERSION}.</p>
    </StepBody>
  );
}
