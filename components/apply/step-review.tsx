"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CreditCard, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AiDocCheck } from "@/components/docs/ai-check";
import { SAMPLE_MISMATCH, checkApplyState } from "@/lib/docs/ai-check";
import { Checkbox, Field, MaskedField } from "@/components/apply/field";
import { StepBody } from "@/components/apply/motion";
import { Note, StepHeading, SummaryRow } from "@/components/apply/step-shell";
import type { StepProps } from "@/components/apply/step-shell";
import {
  formatCardNumber,
  formatDateTime,
  formatExpiry,
  formatMoney,
  maskCardNumber,
  maskDob,
  maskSsn,
} from "@/lib/apply/format";
import { getScreeningFee } from "@/lib/data/mock-data";
import type { ConsentInfo, PaymentInfo } from "@/lib/apply/types";

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

export function StepReview({ state, patch, errors, property, goTo }: StepProps) {
  const [showSample, setShowSample] = useState(false);
  const docCheck = useMemo(
    () => checkApplyState(state, showSample ? [SAMPLE_MISMATCH] : []),
    [state, showSample],
  );
  const fee = getScreeningFee(state.screeningPackage);
  const p = state.personal;
  const setConsent = (partial: Partial<ConsentInfo>) =>
    patch({ consent: { ...state.consent, ...partial } });
  const setPayment = (partial: Partial<PaymentInfo>) =>
    patch({ payment: { ...state.payment, ...partial } });

  const address = [p.street, p.unit, p.city, [p.state, p.zip].filter(Boolean).join(" ")]
    .filter(Boolean)
    .join(", ");

  return (
    <StepBody>
      <StepHeading lead="Review and pay." tone="Last look before it goes out." />

      <ReviewBlock title="You" step={2} goTo={goTo}>
        <SummaryRow label="Name" value={`${p.firstName} ${p.lastName}`.trim() || "—"} />
        <SummaryRow label="Email" value={p.email || "—"} />
        <SummaryRow label="Phone" value={p.phone || "—"} />
        <SummaryRow label="Date of birth" value={maskDob(p.dateOfBirth)} />
        <SummaryRow label="SSN" value={maskSsn(p.ssn)} />
        <SummaryRow label="Address" value={address || "—"} />
      </ReviewBlock>

      <ReviewBlock title="Photo ID" step={3} goTo={goTo}>
        <SummaryRow label="Front" value={state.idFront?.name ?? "Missing"} />
        <SummaryRow label="Back" value={state.idBack?.name ?? "Missing"} />
      </ReviewBlock>

      <ReviewBlock title="Income" step={4} goTo={goTo}>
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

      <ReviewBlock title="Bank" step={5} goTo={goTo}>
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

      <ReviewBlock title="Credit report" step={6} goTo={goTo}>
        <SummaryRow label="Source" value="Experian (demo)" />
        <SummaryRow label="Score" value={state.experian.score ?? "Not connected"} />
        <SummaryRow label="Pulled" value={formatDateTime(state.experian.pulledAt)} />
        <SummaryRow label="Extra Experian fee" value="$0.00" />
      </ReviewBlock>

      <ReviewBlock title="Household" step={7} goTo={goTo}>
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

      {/* FCRA-style authorization */}
      <section className="rounded-lg border border-line bg-paper p-5 shadow-window">
        <h2 className="text-[17px] font-semibold tracking-[-0.3px] text-ink">
          Authorization and disclosure
        </h2>
        <div className="mt-3 max-h-56 overflow-y-auto rounded-btn border border-line bg-mist p-4 text-[13px] font-medium leading-5 text-mute">
          <p className="font-semibold text-ink-2">
            Disclosure regarding consumer reports and investigative consumer reports
          </p>
          <p className="mt-2">
            In connection with your rental application for {property.address}, a consumer report
            and/or investigative consumer report may be obtained about you. These reports may
            include information about your credit history, rental history, eviction records, and
            criminal records, obtained from consumer reporting agencies.
          </p>
          <p className="mt-2">
            Under the Fair Credit Reporting Act you have the right to request disclosure of the
            nature and scope of any investigative consumer report, to know whether a report was
            obtained, and to receive a free copy of any report that results in an adverse decision.
            You also have the right to dispute the accuracy or completeness of any information in
            your file.
          </p>
          <p className="mt-2">
            If your application is declined based in whole or in part on information in a consumer
            report, you will receive an adverse action notice identifying the reporting agency and
            explaining your rights.
          </p>
          <p className="mt-2 font-semibold text-ink-2">
            This is prototype text for a demo application. No consumer reporting agency is used, no
            report is obtained, and nothing you enter here is transmitted or stored off your device.
          </p>
        </div>

        <div className="mt-4 space-y-1">
          <Checkbox
            id="fcra"
            checked={state.consent.fcra}
            error={errors.fcra}
            onChange={(checked) => setConsent({ fcra: checked })}
          >
            I have read the disclosure and authorize Leaseproof to obtain consumer reports about me
            for this rental application.
          </Checkbox>
          <Checkbox
            id="backgroundAck"
            checked={state.consent.backgroundAck}
            error={errors.backgroundAck}
            onChange={(checked) => setConsent({ backgroundAck: checked })}
          >
            I understand a public-records background search is part of this screening, and that in
            this prototype it is a mock note only.
          </Checkbox>
        </div>

        <div className="mt-4 max-w-sm">
          <Field
            id="signature"
            label="Electronic signature"
            placeholder="Type your full name"
            autoComplete="off"
            value={state.consent.signature}
            error={errors.signature}
            hint="Typing your name here counts as your signature."
            onChange={(event) => setConsent({ signature: event.target.value })}
          />
        </div>
      </section>

      {/* Mock payment */}
      <section className="rounded-lg border border-line bg-paper p-5 shadow-window">
        <div className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-mute" aria-hidden />
          <h2 className="text-[17px] font-semibold tracking-[-0.3px] text-ink">Payment</h2>
        </div>

        <dl className="mt-4 rounded-btn border border-line bg-mist px-4 py-2">
          <SummaryRow
            label="Standard screening"
            value={formatMoney(fee)}
          />
          <SummaryRow label="Experian — included" value="$0 extra" />
          <SummaryRow
            label="Total due today"
            value={<span className="num text-[16px] font-semibold">{formatMoney(fee)}</span>}
          />
        </dl>

        <div className="mt-4 space-y-4">
          <Field
            id="cardName"
            label="Name on card"
            autoComplete="off"
            value={state.payment.cardName}
            error={errors.cardName}
            onChange={(event) => setPayment({ cardName: event.target.value })}
          />
          <MaskedField
            id="cardNumber"
            label="Card number"
            inputMode="numeric"
            autoComplete="off"
            placeholder="4242 4242 4242 4242"
            maskedValue={maskCardNumber(state.payment.cardNumber)}
            value={state.payment.cardNumber}
            error={errors.cardNumber}
            hint="Demo checkout — no card is charged. Any 16 digits will do."
            onChange={(event) => setPayment({ cardNumber: formatCardNumber(event.target.value) })}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field
              id="expiry"
              label="Expiry"
              inputMode="numeric"
              placeholder="MM/YY"
              autoComplete="off"
              value={state.payment.expiry}
              error={errors.expiry}
              onChange={(event) => setPayment({ expiry: formatExpiry(event.target.value) })}
            />
            <MaskedField
              id="cvc"
              label="Security code"
              inputMode="numeric"
              autoComplete="off"
              maskedValue="•••"
              maxLength={4}
              value={state.payment.cvc}
              error={errors.cvc}
              onChange={(event) =>
                setPayment({ cvc: event.target.value.replace(/\D/g, "").slice(0, 4) })
              }
            />
            <Field
              id="billingZip"
              label="Billing ZIP"
              inputMode="numeric"
              autoComplete="off"
              maxLength={5}
              value={state.payment.billingZip}
              error={errors.billingZip}
              onChange={(event) =>
                setPayment({ billingZip: event.target.value.replace(/\D/g, "").slice(0, 5) })
              }
            />
          </div>
        </div>
      </section>

      <Note>
        Card details are never saved, not even in this prototype&apos;s local draft. Submitting
        records a mock payment only.
      </Note>
    </StepBody>
  );
}
