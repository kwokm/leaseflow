import type { ReactNode } from "react";
import { ListingPhotoStrip } from "@/components/listings/photos";
import type { RentalApplication } from "@/lib/apply/rental-app";
import { cn } from "@/lib/utils";

function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="border-b border-line py-2 last:border-b-0">
      <dt className="text-[11px] font-medium uppercase tracking-[0.06em] text-mute-2">{label}</dt>
      <dd className="mt-0.5 text-[13px] font-medium text-ink">{value || "—"}</dd>
    </div>
  );
}

function Block({
  n,
  title,
  children,
}: {
  n: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="print-avoid-break border-b border-line px-5 py-5 last:border-b-0 sm:px-6">
      <h3 className="text-[12px] font-medium uppercase tracking-[0.06em] text-mute-2">
        {n}. {title}
      </h3>
      <div className="mt-3">{children}</div>
    </section>
  );
}

export function ApplicationToRent({
  application,
  className,
}: {
  application: RentalApplication;
  className?: string;
}) {
  const moveIn = new Date(`${application.premises.moveIn}T12:00:00`);
  const moveInLabel = Number.isNaN(moveIn.getTime())
    ? application.premises.moveIn
    : moveIn.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const signed = new Date(application.signedAt);

  return (
    <article className={cn("rental-app bg-paper", className)}>
      <header className="border-b border-line px-5 py-5 sm:px-6">
        <p className="text-[12px] font-medium uppercase tracking-[0.06em] text-mute-2">
          I. Application to Rent
        </p>
        <h2 className="mt-1 text-[20px] font-semibold tracking-[-0.4px] text-ink">
          LeaseFlow rental application
        </h2>
        <p className="mt-1 text-[13px] font-medium text-mute">
          Auto-filled from the apply packet. Prototype form — not a C.A.R. document.
        </p>
        {application.premises.photos.length ? (
          <div className="mt-3">
            <ListingPhotoStrip photos={application.premises.photos} alt={application.premises.address} />
          </div>
        ) : null}
      </header>

      <Block n="1" title="Applicant">
        <dl className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
          <Field label="Completing as" value="Tenant" />
          <Field label="Total applicants" value={String(application.totalApplicants)} />
        </dl>
      </Block>

      <Block n="2" title="Premises">
        <dl className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
          <Field label="Address" value={application.premises.address} />
          <Field label="Rent" value={`$${application.premises.rent.toLocaleString()}/mo`} />
          <Field label="Proposed move-in" value={moveInLabel} />
        </dl>
      </Block>

      <Block n="3" title="Personal">
        <dl className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
          <Field label="Full name" value={application.personal.fullName} />
          <Field label="Date of birth" value={application.personal.dateOfBirth} />
          <Field label="Driver’s license" value={application.personal.license} />
          <Field label="SSN" value={application.ssnDisplay} />
          <Field label="Mobile" value={application.personal.mobile} />
          <Field label="Work phone" value={application.personal.workPhone} />
          <Field label="Email" value={application.personal.email} />
          <Field label="Other occupants" value={application.personal.occupants} />
          <Field label="Pets" value={application.personal.pets} />
          <Field label="Auto" value={application.personal.vehicle} />
          <Field label="Emergency contact" value={application.personal.emergency} />
        </dl>
        <dl className="mt-3 grid grid-cols-1 gap-x-6 sm:grid-cols-2">
          {application.disclosures.map((row) => (
            <Field key={row.label} label={row.label} value={row.value} />
          ))}
        </dl>
      </Block>

      <Block n="4" title="Residence history">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {application.residences.map((block) => (
            <div key={block.title}>
              <p className="mb-1 text-[13px] font-semibold text-ink">{block.title}</p>
              <dl>
                {block.lines.map(([label, value]) => (
                  <Field key={label} label={label} value={value} />
                ))}
              </dl>
            </div>
          ))}
        </div>
      </Block>

      <Block n="5" title="Employment and income">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {application.employment.map((block) => (
            <div key={block.title}>
              <p className="mb-1 text-[13px] font-semibold text-ink">{block.title}</p>
              <dl>
                {block.lines.map(([label, value]) => (
                  <Field key={label} label={label} value={value} />
                ))}
              </dl>
            </div>
          ))}
        </div>
        <dl className="mt-3">
          <Field label="Other income" value={application.otherIncome} />
        </dl>
      </Block>

      <Block n="6" title="Credit">
        <dl>
          {application.creditors.map(([name, detail]) => (
            <Field key={name} label={name} value={detail} />
          ))}
          {application.bank.map(([label, value]) => (
            <Field key={label} label={label} value={value} />
          ))}
        </dl>
        <p className="mt-2 text-[12px] text-mute">SSN is not collected on this form.</p>
      </Block>

      <Block n="7" title="Personal references">
        <dl>
          {application.references.map(([name, detail]) => (
            <Field key={name} label={name} value={detail} />
          ))}
        </dl>
      </Block>

      <Block n="8" title="Nearest relatives">
        <dl>
          {application.relatives.map(([name, detail]) => (
            <Field key={name} label={name} value={detail} />
          ))}
        </dl>
      </Block>

      <Block n="9" title="Acknowledgments">
        <ul className="space-y-1.5 text-[13px] font-medium text-ink">
          {application.acknowledgments.map((line) => (
            <li key={line}>☑ {line}</li>
          ))}
        </ul>
        <dl className="mt-4">
          <Field label="Signature" value={application.signature} />
          <Field
            label="Date / time"
            value={
              Number.isNaN(signed.getTime())
                ? application.signedAt
                : signed.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })
            }
          />
        </dl>
      </Block>

      <Block n="II" title="Screening fee">
        <dl className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
          <Field label="Package" value={application.screeningFee.packageLabel} />
          <Field label="Amount" value={application.screeningFee.amount} />
          <Field label="Status" value={application.screeningFee.status} />
          <Field label="Paid via" value="LeaseFlow · applicant pays" />
        </dl>
        <p className="mt-2 text-[12px] text-mute">{application.screeningFee.note}</p>
      </Block>

      <section className="print-avoid-break px-5 py-5 sm:px-6">
        <h3 className="text-[12px] font-medium uppercase tracking-[0.06em] text-mute-2">
          Background check notice
        </h3>
        <p className="mt-2 text-[13px] font-medium leading-5 text-mute">{application.noticeBody}</p>
      </section>
    </article>
  );
}
