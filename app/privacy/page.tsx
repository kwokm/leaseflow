import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Privacy — Leaseproof",
  description: "How Leaseproof handles information in the Orange County private beta.",
};

export default function PrivacyPage() {
  return (
    <LegalPage meta="Privacy" title="Privacy">
      <p>
        Leaseproof is a working name for an Orange County private beta. It is not a live trademark
        claim.
      </p>
      <p>
        When a renter applies, we collect the information they type and the documents they upload so
        the landlord can review a screening packet. Files are stored privately. We do not sell
        applicant data.
      </p>
      <p>
        Screening reports are consumer reports under the FCRA. Credit, background, and score data
        shown on marketing illustrations today is mock — names, scores, and tradelines are
        fabricated and no consumer reporting agency is used yet.
      </p>
    </LegalPage>
  );
}
