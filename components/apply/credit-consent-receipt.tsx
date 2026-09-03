import { CREDIT_DISCLOSURE_HEADING, FCRA_PACK_VERSION } from "@/lib/legal/fcra";
import { formatDateTime } from "@/lib/apply/format";
import { SummaryRow } from "@/components/apply/step-shell";

export type CreditConsentReceiptData = {
  typedFullName?: string;
  signature?: string;
  consentedAt?: string;
  acceptedAt?: string;
  copyVersion?: string;
  disclosureText?: string;
  recipientName?: string;
};

export function CreditConsentReceipt({
  consent,
  heading = "What you agreed to",
}: {
  consent: CreditConsentReceiptData;
  heading?: string;
}) {
  const name = consent.typedFullName?.trim() || consent.signature?.trim();
  const when = consent.consentedAt || consent.acceptedAt;
  const version = consent.copyVersion ?? FCRA_PACK_VERSION;
  const disclosure = consent.disclosureText?.trim();

  if (!name && !disclosure && !when) return null;

  return (
    <section className="rounded-lg border border-line bg-paper p-5 shadow-window">
      <h2 className="text-[17px] font-semibold tracking-[-0.3px] text-ink">{heading}</h2>
      <p className="mt-1 text-[13px] font-medium leading-5 text-mute">
        Receipt of the Credit-step disclosure this applicant authorized.
      </p>
      <dl className="mt-3">
        <SummaryRow label="Who" value={name || "—"} />
        <SummaryRow label="When" value={formatDateTime(when)} />
        <SummaryRow label="Copy version" value={version} />
        {consent.recipientName ? (
          <SummaryRow label="Shared with" value={consent.recipientName} />
        ) : null}
      </dl>
      {disclosure ? (
        <div className="mt-4 rounded-btn border border-line bg-mist p-4">
          <p className="text-[13px] font-semibold text-ink-2">{CREDIT_DISCLOSURE_HEADING}</p>
          {disclosure.split("\n\n").map((paragraph) => (
            <p
              key={paragraph.slice(0, 48)}
              className="mt-2 whitespace-pre-wrap text-[13px] font-medium leading-5 text-mute"
            >
              {paragraph}
            </p>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-[13px] font-medium text-mute">
          Stored snapshot: copy version {version}.
        </p>
      )}
    </section>
  );
}
