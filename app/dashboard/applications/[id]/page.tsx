"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/desk/avatar";
import { DeskPill } from "@/components/desk/packet-window";
import { StatusPill } from "@/components/desk/status-pill";
import { ApplicationToRent } from "@/components/rental-app/application-to-rent";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getApplicantById,
  getApplicationDetails,
  getExperianPull,
  getPropertyById,
  getReportByApplicant,
  groupDocuments,
} from "@/lib/data/mock-data";
import { downloadPacket } from "@/lib/packet-document";
import { getSubmission } from "@/lib/apply/storage";
import {
  confirmationIdFromApplicantId,
  isLocalApplicantId,
  submissionApplicant,
  submissionDetails,
  submissionExperian,
  submissionReport,
} from "@/lib/apply/to-packet";
import { setDecision, withDecision } from "@/lib/desk/decisions";
import { creditScore, incomeMultiple, shortAddress } from "@/lib/desk/display";
import { Reveal } from "@/components/motion/reveal";
import { AiDocCheck } from "@/components/docs/ai-check";
import { SAMPLE_MISMATCH, checkApplicationDetails } from "@/lib/docs/ai-check";
import { resolveRentalPacket } from "@/lib/apply/rental-app";
import type { ApplyState } from "@/lib/apply/types";
import type { ApplicationStatus } from "@/lib/data/mock-data";
import type { RentalApplication } from "@/lib/apply/rental-app";
import { queueLease, useLeaseByApplication } from "@/lib/leasing/store";

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-line py-2.5 last:border-b-0">
      <dt className="text-[13px] font-medium text-mute">{label}</dt>
      <dd className="min-w-0 text-right text-[13px] font-medium text-ink">{value}</dd>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Reveal>
      <section className="border-b border-line px-5 py-5 last:border-b-0 sm:px-6">
        <h2 className="mb-3 text-[12px] font-medium uppercase tracking-[0.06em] text-mute-2">
          {title}
        </h2>
        {children}
      </section>
    </Reveal>
  );
}

export default function ApplicationPacketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [adverseActionOpen, setAdverseActionOpen] = useState(false);
  const [statusOverride, setStatusOverride] = useState<ApplicationStatus | null>(null);
  const [showSample, setShowSample] = useState(false);
  const [tab, setTab] = useState<"packet" | "application">("packet");
  const [rental, setRental] = useState<RentalApplication | null>(null);

  const local = isLocalApplicantId(id);
  const [submission, setSubmission] = useState<ApplyState | undefined>();
  const [submissionChecked, setSubmissionChecked] = useState(!local);

  useEffect(() => {
    if (!local) return;
    setSubmission(getSubmission(confirmationIdFromApplicantId(id)));
    setSubmissionChecked(true);
  }, [id, local]);

  useEffect(() => {
    setRental(resolveRentalPacket(id)?.application ?? null);
  }, [id, submission]);

  const seeded = local
    ? submission
      ? submissionApplicant(submission)
      : undefined
    : getApplicantById(id);
  const applicant = seeded
    ? { ...withDecision(seeded), ...(statusOverride ? { status: statusOverride } : {}) }
    : undefined;
  const property = applicant ? getPropertyById(applicant.propertyId) : undefined;
  const report = local
    ? submission
      ? submissionReport(submission)
      : undefined
    : applicant
      ? getReportByApplicant(applicant.id)
      : undefined;
  const details = local
    ? submission
      ? submissionDetails(submission)
      : undefined
    : applicant
      ? getApplicationDetails(applicant.id)
      : undefined;
  const experian = local
    ? submission
      ? submissionExperian(submission)
      : undefined
    : applicant
      ? getExperianPull(applicant.id)
      : undefined;
  const lease = useLeaseByApplication(id);

  if (local && !submissionChecked) {
    return <p className="px-6 py-12 text-[13px] text-mute">Loading the application…</p>;
  }

  if (!applicant || !property) {
    return (
      <Reveal className="px-6 py-12 text-center">
        <p className="text-[15px] font-medium text-ink">Application not found</p>
        <p className="mt-1 text-[13px] text-mute">
          {local
            ? "Applications submitted in this prototype are stored in the browser that submitted them."
            : "This application is no longer available."}
        </p>
        <Button asChild className="mt-4">
          <Link href="/dashboard">Back to the desk</Link>
        </Button>
      </Reveal>
    );
  }

  const fullName = `${applicant.firstName} ${applicant.lastName}`;
  const decided = applicant.status === "approved" || applicant.status === "declined";
  const multiple = incomeMultiple(applicant);
  const credit = creditScore(applicant);

  function decide(next: "approved" | "declined") {
    setDecision(id, next);
    setStatusOverride(next);
    if (next === "approved") {
      const nextLease = queueLease({
        applicationId: id,
        listingId: property.id,
        tenantName: fullName,
        address: property.address,
        rent: property.rent,
      });
      router.push(`/dashboard/leases/${nextLease.id}`);
      return;
    }
    router.push("/dashboard/applications");
  }

  return (
    <div>
      <Reveal>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar firstName={applicant.firstName} lastName={applicant.lastName} large />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-[18px] font-semibold tracking-[-0.3px] text-ink">{fullName}</h1>
              <StatusPill status={applicant.status} />
            </div>
            <p className="mt-0.5 truncate text-[13px] text-mute">
              {shortAddress(property.address)} · {applicant.email}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 print:hidden">
          <Button asChild variant="outline" size="sm">
            <Link href={`/packet/${id}`}>Share</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/applications">Back</Link>
          </Button>
          {lease ? (
            <Button asChild size="sm">
              <Link href={`/dashboard/leases/${lease.id}`}>Open lease</Link>
            </Button>
          ) : null}
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            Print
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => downloadPacket({ applicant, property, details, report, experian })}
          >
            Download
          </Button>
          {!decided && (
            <>
              <Button size="sm" onClick={() => decide("approved")}>
                Approve
              </Button>
              <Button variant="destructive" size="sm" onClick={() => setAdverseActionOpen(true)}>
                Decline
              </Button>
            </>
          )}
        </div>
      </div>
      </Reveal>

      <div className="border-b border-line px-5 py-3 print:hidden sm:px-6">
        <div className="flex flex-wrap items-center gap-1.5">
          <DeskPill active={tab === "packet"} onClick={() => setTab("packet")}>
            Packet
          </DeskPill>
          <DeskPill active={tab === "application"} onClick={() => setTab("application")}>
            Application
          </DeskPill>
        </div>
      </div>

      {tab === "application" && rental ? (
        <Reveal>
          <ApplicationToRent application={rental} />
        </Reveal>
      ) : null}

      {tab === "packet" ? (
        <>
      <Section title="Identity">
        <dl>
          <Row label="Applicant" value={fullName} />
          <Row label="Email" value={applicant.email} />
          <Row label="Phone" value={applicant.phone} />
          <Row label="Date of birth" value={details?.dateOfBirth ?? "—"} />
          <Row label="SSN" value={details ? `•••-••-${details.ssnLast4}` : "—"} />
          <Row label="Current address" value={details?.currentAddress.address ?? "—"} />
        </dl>
      </Section>

      <Section title="LeaseScore">
        {report ? (
          <dl>
            <Row label="LeaseScore" value={<span className="score">{report.credit.leaseScore}</span>} />
            <Row label="Credit" value={credit ?? "—"} />
            <Row label="Income" value={multiple ? `${multiple.toFixed(1)}× rent` : "—"} />
            <Row label="Status" value={<StatusPill status={applicant.status} />} />
          </dl>
        ) : (
          <p className="text-[13px] text-mute">
            {applicant.status === "invited"
              ? "Invited — the packet has not been submitted yet."
              : "Screening lands here once the applicant finishes."}
          </p>
        )}
      </Section>

      <Section title="Experian (demo)">
        {experian ? (
          <dl>
            <Row label="Provider" value={experian.provider} />
            <Row label="Score" value={<span className="score">{experian.score}</span>} />
            <Row label="Model" value={experian.scoreModel} />
            <Row label="On-time payments" value={`${experian.onTimePaymentRate}%`} />
            <Row label="Open accounts" value={experian.openAccounts} />
            <Row label="Public records" value={experian.publicRecords} />
          </dl>
        ) : (
          <p className="text-[13px] text-mute">No demo credit pull on this file.</p>
        )}
        <p className="mt-3 text-[12px] text-mute-2">
          Mock pull only. No consumer reporting agency was contacted.
        </p>
      </Section>

      <Section title="Income">
        {report ? (
          <dl>
            <Row label="Employer" value={report.income.employer} />
            <Row label="Position" value={report.income.position} />
            <Row
              label="Monthly income"
              value={`$${report.income.monthlyIncome.toLocaleString()}`}
            />
            <Row label="Rent multiple" value={multiple ? `${multiple.toFixed(1)}×` : "—"} />
            <Row label="Verified" value={report.income.verified ? "Yes" : "No"} />
          </dl>
        ) : details ? (
          <dl>
            <Row label="Employer" value={details.employment.employer} />
            <Row
              label="Stated monthly income"
              value={`$${details.employment.monthlyIncome.toLocaleString()}`}
            />
          </dl>
        ) : (
          <p className="text-[13px] text-mute">No income on this file yet.</p>
        )}
      </Section>

      <Section title="AI document check">
        <AiDocCheck
          report={checkApplicationDetails(
            details,
            fullName,
            showSample ? [SAMPLE_MISMATCH] : [],
          )}
          showSample={showSample}
          onToggleSample={() => setShowSample((value) => !value)}
          scan={false}
          embedded
        />
      </Section>

      <Section title="Documents">
        {details && details.documents.length > 0 ? (
          <table className="app-table">
            <thead>
              <tr>
                <th>File</th>
                <th>Type</th>
                <th>Added</th>
              </tr>
            </thead>
            <tbody>
              {groupDocuments(details.documents).flatMap((group) =>
                group.documents.map((doc) => (
                  <tr key={`${group.type}-${doc.name}`}>
                    <td>
                      {doc.name}
                      {doc.previewAvailable === false ? (
                        <span className="mt-0.5 block text-[11px] text-mute-2">
                          Preview unavailable after reload
                        </span>
                      ) : null}
                    </td>
                    <td>{group.label}</td>
                    <td>{new Date(doc.uploadedAt).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        ) : (
          <p className="text-[13px] text-mute">No documents were uploaded with this application.</p>
        )}
      </Section>

      <Section title="Background">
        {report ? (
          <dl>
            <Row
              label="Criminal"
              value={report.background.criminal === "clear" ? "Clear" : "Records found"}
            />
            <Row
              label="Eviction"
              value={report.background.eviction === "clear" ? "Clear" : "Records found"}
            />
            <Row
              label="Registry"
              value={report.background.sexOffender === "clear" ? "Clear" : "Records found"}
            />
            {report.background.details ? (
              <Row label="Notes" value={report.background.details} />
            ) : null}
          </dl>
        ) : (
          <p className="text-[13px] text-mute">Background has not landed on this packet yet.</p>
        )}
      </Section>

      <Section title="FCRA">
        <p className="text-[13px] font-medium leading-5 text-mute">
          Screening reports are consumer reports under the FCRA. This packet is a prototype — names,
          scores, and tradelines are mock data, and no consumer reporting agency is used.
        </p>
        {details ? (
          <dl className="mt-3">
            <Row label="Signature" value={details.consent.signature} />
            <Row
              label="Consent"
              value={new Date(details.consent.acceptedAt).toLocaleString()}
            />
          </dl>
        ) : null}
      </Section>
        </>
      ) : null}

      <Dialog open={adverseActionOpen} onOpenChange={setAdverseActionOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Decline this packet</DialogTitle>
            <DialogDescription>
              Demo notice only. The queue pill will change to Declined. No notice is sent.
            </DialogDescription>
          </DialogHeader>
          <p className="text-[13px] leading-5 text-mute">
            {fullName} at {shortAddress(property.address)} will show as Declined on the desk. This
            is mock data — no consumer reporting agency is used.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdverseActionOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => decide("declined")}>
              Decline
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
