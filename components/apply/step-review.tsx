"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CreditCard, Lock, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AiDocCheck } from "@/components/docs/ai-check";
import { SAMPLE_MISMATCH, checkApplyState } from "@/lib/docs/ai-check";
import { CreditConsentReceipt } from "@/components/apply/credit-consent-receipt";
import { StepBody } from "@/components/apply/motion";
import { Note, StepHeading, SummaryRow } from "@/components/apply/step-shell";
import type { StepProps } from "@/components/apply/step-shell";
import { useRuntimeConfig } from "@/components/config/runtime-config";
import { formatDateTime, formatMoney, maskDob, maskSsn } from "@/lib/apply/format";
import { getScreeningFee } from "@/lib/data/mock-data";
import { APPLY_STEP } from "@/lib/apply/types";

function ReviewBlock({
  title,
  step,
  goTo,
  children,
}: {
  title: string;
  step: number;
  goTo: (step: number) => void;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-line bg-paper p-5 shadow-window transition-[border-color,box-shadow] duration-200 ease-premium">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[17px] font-semibold tracking-[-0.3px] text-ink">{title}</h2>
        <Button type="button" variant="ghost" size="sm" onClick={() => goTo(step)}>
          <Pencil className="h-3.5 w-3.5" aria-hidden />
          Edit
        </Button>
      </div>
      <dl className="mt-3">{children}</dl>
    </section>
  );
}

export function StepReview({ state, property, goTo }: StepProps) {
  const [showSample, setShowSample] = useState(false);
  const config = useRuntimeConfig();
  const docCheck = useMemo(
    () => checkApplyState(state, showSample ? [SAMPLE_MISMATCH] : []),
    [state, showSample],
  );
  const fee = getScreeningFee(state.screeningPackage);
  const p = state.personal;

  const address = [p.street, p.unit, p.city, [p.state, p.zip].filter(Boolean).join(" ")]
    .filter(Boolean)
    .join(", ");

  return (
    <StepBody>
      <StepHeading lead="Review and pay." tone="Last look before it goes out." />

      <ReviewBlock title="You" step={APPLY_STEP.you} goTo={goTo}>
        <SummaryRow label="Name" value={`${p.firstName} ${p.lastName}`.trim() || "—"} />
        <SummaryRow label="Email" value={p.email || "—"} />
        <SummaryRow label="Phone" value={p.phone || "—"} />
        <SummaryRow label="Date of birth" value={maskDob(p.dateOfBirth)} />
        <SummaryRow label="SSN" value={maskSsn(p.ssn)} />
        <SummaryRow label="Address" value={address || "—"} />
      </ReviewBlock>

      <ReviewBlock title="Photo ID" step={APPLY_STEP.proof} goTo={goTo}>
        <SummaryRow label="Front" value={state.idFront?.name ?? "Missing"} />
        <SummaryRow label="Back" value={state.idBack?.name ?? "Missing"} />
      </ReviewBlock>

      <ReviewBlock title="Income" step={APPLY_STEP.proof} goTo={goTo}>
        <SummaryRow label="Employer" value={state.income.employer || "—"} />
        <SummaryRow label="Position" value={state.income.position || "—"} />
        <SummaryRow
          label="Gross monthly income"
          value={
            state.income.monthlyIncome
              ? formatMoney(Number(state.income.monthlyIncome.replace(/[^0-9.]/g, "")) || 0)
              : "—"
          }
        />
        <SummaryRow
          label="Pay stubs"
          value={
            state.paystubs.length
              ? state.paystubs.map((file) => file.name).join(", ")
              : "None attached"
          }
        />
      </ReviewBlock>

      <ReviewBlock title="Bank" step={APPLY_STEP.proof} goTo={goTo}>
        <SummaryRow label="Bank" value={state.bank.bankName || "—"} />
        <SummaryRow
          label="Account"
          value={state.bank.accountLast4 ? `•••• ${state.bank.accountLast4}` : "—"}
        />
        <SummaryRow
          label="Statements"
          value={
            state.statements.length
              ? state.statements.map((file) => file.name).join(", ")
              : "None attached"
          }
        />
      </ReviewBlock>

      <AiDocCheck
        report={docCheck}
        showSample={showSample}
        onToggleSample={() => setShowSample((value) => !value)}
      />

      <section className="rounded-lg border border-line bg-paper p-5 shadow-window">
        <h2 className="text-[17px] font-semibold tracking-[-0.3px] text-ink">
          Application to Rent
        </h2>
        <p className="mt-1 text-[13px] font-medium text-mute">
          Auto-filled from this packet for {property.address.split(",")[0]}. Everyone with the
          share link can open it.
        </p>
        <div className="mt-3">
          <Button asChild variant="outline" size="sm">
            <Link href={`/packet/${property.id}`}>Open filled application</Link>
          </Button>
        </div>
      </section>

      <ReviewBlock title="Credit report" step={APPLY_STEP.credit} goTo={goTo}>
        <SummaryRow label="Source" value="Experian Connect" />
        <SummaryRow
          label="Status"
          value={
            state.experian.status === "connected"
              ? "Shared"
              : state.experian.status === "authorized"
                ? "Authorized — runs after payment"
                : "Not authorized"
          }
        />
        <SummaryRow label="Score" value={state.experian.score ?? "—"} />
        <SummaryRow label="Shared" value={formatDateTime(state.experian.pulledAt)} />
        <SummaryRow label="Extra Experian fee" value="$0.00" />
      </ReviewBlock>

      <ReviewBlock title="Household" step={APPLY_STEP.you} goTo={goTo}>
        <SummaryRow
          label="Pets"
          value={
            state.household.pets.length
              ? state.household.pets
                  .map((pet) => [pet.type, pet.breed].filter(Boolean).join(" — "))
                  .join("; ")
              : "None"
          }
        />
        <SummaryRow
          label="Other occupants"
          value={
            state.household.occupants.length
              ? state.household.occupants.map((entry) => entry.name).join(", ")
              : "None"
          }
        />
        <SummaryRow label="Smoker" value={state.household.smoker ? "Yes" : "No"} />
        <SummaryRow label="Prior eviction" value={state.household.priorEviction ? "Yes" : "No"} />
      </ReviewBlock>

      <CreditConsentReceipt consent={state.consent} />

      {/* Stripe Checkout hand-off — card details are entered on Stripe, not here. */}
      <section className="rounded-lg border border-line bg-paper p-5 shadow-window">
        <div className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-mute" aria-hidden />
          <h2 className="text-[17px] font-semibold tracking-[-0.3px] text-ink">Payment</h2>
        </div>

        <dl className="mt-4 rounded-btn border border-line bg-mist px-4 py-2">
          <SummaryRow label="Standard screening" value={formatMoney(fee)} />
          <SummaryRow label="Experian — included" value="$0 extra" />
          <SummaryRow
            label="Total due today"
            value={<span className="num text-[16px] font-semibold">{formatMoney(fee)}</span>}
          />
        </dl>

        <p className="mt-4 flex items-start gap-2 text-[14px] font-medium leading-5 text-mute">
          <Lock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          {config.stripe && config.liveFees
            ? "Continue to Stripe to pay. Your card details are entered on Stripe's secure page and never reach Leaseproof. Your credit report is requested only after this payment clears."
            : config.stripe
              ? "Continue to Stripe Checkout in test mode. Card details stay on Stripe. This is not a collected landlord screening fee."
              : config.demo
                ? "Demo deployment — checkout is skipped and no card is charged."
                : "Payments are not configured on this deployment yet."}
        </p>
      </section>

      <Note>
        {config.stripe && config.liveFees
          ? "You pay $24.99 once. Experian is included. This checkout is not a landlord screening-fee collection for the property."
          : config.stripe
            ? "Stripe Checkout is in test mode for this private beta. This is not a collected landlord screening fee."
            : "No charge is made on this deployment."}
      </Note>
    </StepBody>
  );
}
