import type { Metadata } from "next";
import { MarketingCtas } from "@/components/marketing/marketing-ctas";
import { MarketingPage, MarketingSection } from "@/components/marketing/marketing-page";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About us — Leaseproof",
  description: "AAI Suzuki LLC / Leaseproof. Orange County private beta. The landlord decides.",
};

export default function AboutPage() {
  return (
    <MarketingPage kicker="About us" title="Screen. Organize the packet. The landlord decides.">
      <MarketingSection title="AAI Suzuki LLC / Leaseproof">
        <p>
          Leaseproof is a working name from AAI Suzuki LLC. We are running a private Orange County
          beta: invited landlords screen applicants, AI Income Check reads the uploads, and the
          packet lands in one place.
        </p>
      </MarketingSection>

      <MarketingSection title="What we are building">
        <p>
          A desk that organizes the file so a landlord can decide. Not a marketplace. Not a
          public applicant board. Not a consumer reporting agency that “verifies” income.
        </p>
      </MarketingSection>

      <MarketingCtas />
    </MarketingPage>
  );
}
