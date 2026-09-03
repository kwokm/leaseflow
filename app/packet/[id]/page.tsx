"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { BrandMark, BrandWord } from "@/components/brand";
import { PacketWindow } from "@/components/desk/packet-window";
import { AiIncomeLine, PacketHouseholdChrome } from "@/components/desk/household-block";
import { AiDocCheck } from "@/components/docs/ai-check";
import { PageWash } from "@/components/page-wash";
import { Reveal } from "@/components/motion/reveal";
import { SpatialMount, SpatialOrigin } from "@/components/motion/spatial";
import { CreditConsentReceipt } from "@/components/apply/credit-consent-receipt";
import { ApplicantAdverseActionNotices } from "@/components/desk/applicant-adverse-action";
import { ApplicationToRent } from "@/components/rental-app/application-to-rent";
import { RenterHelpActions } from "@/components/apply/renter-help";
import { Button } from "@/components/ui/button";
import { checkApplicationDetails, checkApplyState } from "@/lib/docs/ai-check";
import { resolveRentalPacket } from "@/lib/apply/rental-app";
import { isSampleMarketingPacket } from "@/lib/apply/sample-packet";
import { getReportByApplicant } from "@/lib/data/mock-data";
import { getHousehold } from "@/lib/data/household-model";
import { shortAddress } from "@/lib/desk/display";
import { householdTotals } from "@/lib/desk/household";

export default function SharedPacketPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [packet, setPacket] = useState<ReturnType<typeof resolveRentalPacket>>(() =>
    resolveRentalPacket(id),
  );

  useEffect(() => {
    setPacket(resolveRentalPacket(id));
  }, [id]);

  if (!packet) {
    return (
      <div className="relative min-h-screen bg-white">
        <PageWash />
        <div className="relative z-10 mx-auto max-w-shell px-5 py-24 text-center">
          <p className="text-[15px] font-medium text-ink">Packet not found</p>
          <p className="mx-auto mt-2 max-w-md text-[14px] font-medium leading-5 text-mute">
            Ask your landlord to resend the link.
          </p>
          <RenterHelpActions />
        </div>
      </div>
    );
  }

  const { application, applicant, property, details, state } = packet;
  const fullName = `${applicant.firstName} ${applicant.lastName}`;
  const docCheck = state
    ? checkApplyState(state)
    : checkApplicationDetails(details, fullName);
  const report = getReportByApplicant(applicant.id);
  const household = applicant.householdId
    ? (() => {
        const seeded = getHousehold(applicant.householdId).filter(
          (row) => row.propertyId === applicant.propertyId,
        );
        const byId = new Map(seeded.map((row) => [row.id, row]));
        byId.set(applicant.id, applicant);
        return [...byId.values()];
      })()
    : [applicant];
  const totals = household.length > 1 ? householdTotals(household, property.rent) : undefined;
  const aiIncome = report?.aiIncome;
  const sample = isSampleMarketingPacket(id) || isSampleMarketingPacket(applicant.id);

  return (
    <div className="relative min-h-screen overflow-hidden bg-white print:bg-white">
      <SpatialOrigin>
        <PageWash className="print:hidden" />
      </SpatialOrigin>

      <header className="relative z-50 bg-white print:hidden">
        <div className="mx-auto flex h-16 max-w-header items-center gap-4 px-5 sm:px-8">
          <Link href="/" className="flex items-center gap-2.5 text-ink">
            <BrandMark />
            <BrandWord />
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <Button type="button" variant="outline" onClick={() => window.print()}>
              Print renter packet
            </Button>
          </div>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-shell px-5 pb-12 pt-2 sm:px-8">
        <SpatialMount>
          <PacketWindow
            title={`Application to Rent • ${fullName}`}
            meta={
              sample
                ? `${shortAddress(property.address)} · sample`
                : `${shortAddress(property.address)} · shareable`
            }
            stamp={sample ? "SAMPLE" : undefined}
          >
            <Reveal>
              <div className="border-b border-line px-5 py-4 print:hidden sm:px-6">
                <p className="text-[13px] font-medium text-mute">
                  {sample
                    ? "Sample packet — not a real applicant. Names, scores, and tradelines are fabricated."
                    : "Shareable link — no sign-in. Filled application, listing photos, and AI Income Check."}
                </p>
              </div>
              <PacketHouseholdChrome
                applicant={applicant}
                members={household}
                hrefFor={(memberId) => `/packet/${memberId}`}
              />
              {aiIncome || totals ? (
                <div className="border-b border-line px-5 py-4 sm:px-6">
                  {aiIncome ? <AiIncomeLine screen={aiIncome} /> : null}
                  {totals?.vsRent ? (
                    <p className="mt-1 text-[13px] font-medium text-ink">{totals.vsRent}</p>
                  ) : null}
                  {typeof totals?.householdScore === "number" ? (
                    <p className="mt-0.5 text-[12px] font-medium text-mute">
                      Household LeaseScore {totals.householdScore}
                    </p>
                  ) : null}
                </div>
              ) : null}
              <ApplicationToRent application={application} />
              <div className="border-t border-line px-5 py-5 sm:px-6">
                <CreditConsentReceipt
                  consent={{
                    typedFullName: state?.consent.typedFullName || details?.consent.signature,
                    consentedAt: state?.consent.acceptedAt || details?.consent.acceptedAt,
                    copyVersion: state?.consent.copyVersion || details?.consent.copyVersion,
                    disclosureText:
                      state?.consent.disclosureText || details?.consent.disclosureText,
                    recipientName: state?.consent.recipientName || details?.consent.recipientName,
                  }}
                />
              </div>
              <ApplicantAdverseActionNotices
                applicationIds={[applicant.id, id, state?.applicationId ?? ""]}
              />
              <div className="border-t border-line px-5 py-5 sm:px-6">
                <AiDocCheck report={docCheck} scan={false} embedded />
              </div>
            </Reveal>
          </PacketWindow>
        </SpatialMount>
      </div>
    </div>
  );
}
