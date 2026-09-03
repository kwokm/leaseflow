import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Terms — Leaseproof",
  description: "Terms for the Leaseproof Orange County private beta.",
};

export default function TermsPage() {
  return (
    <LegalPage meta="Terms" title="Terms">
      <p>
        Leaseproof is a working name. The product is an invite-only Orange County beta for
        landlords. Renters apply only through a link a landlord sends.
      </p>
      <p>
        Screening reports are consumer reports under the FCRA. Credit, background, and score data
        shown on marketing illustrations today is mock — names, scores, and tradelines are
        fabricated and no consumer reporting agency is used yet.
      </p>
      <p>
        The Jane Doe packet and landing illustrations are samples, not real applicants. A landlord
        decides who to approve. We do not promise a credit pull, a score, or an approval.
      </p>
    </LegalPage>
  );
}
