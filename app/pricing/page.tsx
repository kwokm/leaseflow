import type { Metadata } from "next";
import { MarketingCtas } from "@/components/marketing/marketing-ctas";
import { MarketingPage, MarketingSection } from "@/components/marketing/marketing-page";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pricing — Leaseproof",
  description: "Applicants pay $24.99. Experian included. $0 extra for landlords.",
};

export default function PricingPage() {
  return (
    <MarketingPage kicker="Pricing" title="Applicants pay $24.99.">
      <p className="text-[16px] font-medium leading-[22px] text-mute">
        Experian is included. $0 extra for landlords. One Standard screening fee — no landlord
        surcharge and no add-on credit package.
      </p>

      <div className="rounded-lg border border-line bg-paper p-6 shadow-window">
        <p className="text-[13px] font-medium text-mute">Standard screening</p>
        <p className="num mt-2 text-[36px] font-semibold leading-none tracking-[-0.6px] text-ink">
          $24.99
        </p>
        <p className="mt-2 text-[16px] font-medium leading-[22px] text-mute">
          Paid by the applicant. Experian included, $0 extra for landlords.
        </p>
      </div>

      <MarketingSection title="What’s in the fee">
        <p>The applicant pays once per application. The fee covers:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Experian Connect — an applicant-permissioned credit share</li>
          <li>Photo ID upload on the apply path</li>
          <li>AI Income Check, which reads the files they upload</li>
          <li>One packet the landlord can open and decide from</li>
        </ul>
        <p>
          We do not charge landlords a per-applicant fee on top of this. Live card charges stay
          off unless the team turns them on for a deployment — this page does not flip that.
        </p>
      </MarketingSection>

      <MarketingSection title="Orange County private beta">
        <p>
          The landlord desk is invite-only. Invited landlords sign up first, then add a listing
          and share its apply link. Renters are not on the invite list — they open the link the
          landlord sends.
        </p>
      </MarketingSection>

      <MarketingCtas />
    </MarketingPage>
  );
}
