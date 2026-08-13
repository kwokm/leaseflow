"use client";

import Link from "next/link";
import { CheckCircle2, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StepBody } from "@/components/apply/motion";
import { Note, Panel, StepHeading, SummaryRow } from "@/components/apply/step-shell";
import type { StepProps } from "@/components/apply/step-shell";
import { formatDateTime, formatMoney, maskCardNumber } from "@/lib/apply/format";
import { getScreeningFee } from "@/lib/data/mock-data";
import { localApplicantId, submissionDocuments } from "@/lib/apply/to-packet";

export function StepDone({ state, property }: StepProps) {
  const fee = getScreeningFee(state.screeningPackage);
  const documents = submissionDocuments(state);
  const packetHref = `/dashboard/applications/${localApplicantId(state.confirmationId ?? "")}`;

  return (
    <StepBody>
      <div className="flex items-start gap-3">
        <CheckCircle2 className="mt-1 h-7 w-7 shrink-0 text-ok" aria-hidden />
        <StepHeading lead="Application submitted." tone="Here is your receipt." />
      </div>

      <p className="max-w-xl text-[15px] font-medium leading-[21px] tracking-[-0.16px] text-mute">
        The landlord for {property.address.split(",")[0]} has your application, documents, and
        credit summary. You&apos;ll hear back by email at {state.personal.email || "your address"}.
      </p>

      {/* Renter receipt — printable */}
      <section className="print-avoid-break rounded-lg border border-line bg-paper p-5 shadow-mini">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line pb-4">
          <div>
            <p className="text-[13px] font-medium text-mute">Receipt</p>
            <p className="mt-1 text-[20px] font-semibold tracking-[-0.4px] text-ink">LeaseFlow</p>
          </div>
          <div className="text-right">
            <p className="text-[13px] font-medium text-mute">Confirmation</p>
            <p className="num mt-1 text-[17px] font-semibold tracking-[-0.3px] text-ink">
              {state.confirmationId}
            </p>
          </div>
        </div>

        <dl className="mt-2">
          <SummaryRow label="Applicant" value={`${state.personal.firstName} ${state.personal.lastName}`.trim() || "—"} />
          <SummaryRow label="Property" value={property.address} />
          <SummaryRow label="Submitted" value={formatDateTime(state.submittedAt)} />
          <SummaryRow
            label={`${state.screeningPackage === "premium" ? "Premium" : "Standard"} screening`}
            value={formatMoney(fee)}
          />
          <SummaryRow label="Credit report — Experian (demo)" value="$0.00" />
          <SummaryRow label="Paid with" value={maskCardNumber(state.payment.cardNumber)} />
          <SummaryRow
            label="Total paid"
            value={<span className="num text-[16px] font-semibold">{formatMoney(fee)}</span>}
          />
        </dl>

        <p className="mt-4 border-t border-line pt-3 text-[12px] font-medium leading-4 text-mute">
          Demo receipt. No card was charged and no consumer reporting agency was contacted.
        </p>
      </section>

      <Panel title="What the landlord received">
        <dl>
          <SummaryRow label="Credit score" value={state.experian.score ?? "—"} />
          <SummaryRow label="Credit source" value="Experian (demo)" />
          <SummaryRow label="Documents" value={`${documents.length} files`} />
          <SummaryRow label="Background" value="Mock public-records note" />
          <SummaryRow label="Signed" value={state.consent.signature || "—"} />
        </dl>

        <ul className="mt-4 space-y-1.5 border-t border-line pt-4">
          {documents.map((doc) => (
            <li
              key={`${doc.name}-${doc.uploadedAt}`}
              className="flex items-center justify-between gap-3 text-[14px] font-medium tracking-[-0.14px] text-ink-2"
            >
              <span className="truncate">{doc.name}</span>
              <span className="shrink-0 text-mute">{doc.kind}</span>
            </li>
          ))}
        </ul>
      </Panel>

      <div className="flex flex-col gap-2 sm:flex-row print:hidden">
        <Button type="button" size="touch" variant="outline" onClick={() => window.print()}>
          <Printer className="h-4 w-4" aria-hidden />
          Print receipt
        </Button>
        <Button asChild size="touch">
          <Link href={packetHref}>View the landlord packet</Link>
        </Button>
      </div>

      <Note>
        This prototype keeps your application in this browser only. Clearing site data removes it.
      </Note>
    </StepBody>
  );
}
