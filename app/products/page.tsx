import type { Metadata } from "next";
import { MarketingCtas } from "@/components/marketing/marketing-ctas";
import { MarketingPage, MarketingSection } from "@/components/marketing/marketing-page";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Products — Leaseproof",
  description:
    "One applicant packet: Experian Connect, AI Income Check, and a landlord desk. The landlord decides.",
};

export default function ProductsPage() {
  return (
    <MarketingPage kicker="Products" title="One packet. The landlord decides.">
      <p className="text-[16px] font-medium leading-[22px] text-mute">
        Leaseproof screens applicants, reads income from the files they upload, and organizes
        everything into one packet. Credit is an applicant-permissioned Experian share. You decide
        who to approve.
      </p>

      <div className="grid gap-px overflow-hidden rounded-lg border border-line bg-line shadow-window sm:grid-cols-2">
        <article className="bg-paper p-5">
          <p className="text-[13px] font-medium text-mute">For landlords</p>
          <p className="mt-2 text-[16px] font-medium leading-[22px] tracking-[-0.16px] text-ink">
            Add a listing, share a link, and read the packet on the desk.
          </p>
          <p className="mt-1 text-[13px] font-medium leading-5 text-mute">
            Pipeline, applications, and properties. Approve or decline from the row. $0 extra.
          </p>
        </article>
        <article className="bg-paper p-5">
          <p className="text-[13px] font-medium text-mute">For renters</p>
          <p className="mt-2 text-[16px] font-medium leading-[22px] tracking-[-0.16px] text-ink">
            Open the landlord’s link, upload, pay $24.99, and share the packet.
          </p>
          <p className="mt-1 text-[13px] font-medium leading-5 text-mute">
            There is no public apply queue. Jane Doe on the landing page is SAMPLE marketing.
          </p>
        </article>
      </div>

      <MarketingSection title="The applicant packet">
        <p>
          One file everyone can open: the filled application, listing photos, Experian, AI Income
          Check, and a LeaseScore. Tenant, landlord, and owner see the same packet.
        </p>
      </MarketingSection>

      <MarketingSection title="Experian Connect">
        <p>
          Applicants pay $24.99. Experian is included. The share is applicant-permissioned — a soft
          pull the renter authorizes, not a landlord-run hard inquiry.
        </p>
        <p>
          Marketing illustrations stamp SAMPLE. They are not a live consumer report and not a real
          applicant.
        </p>
      </MarketingSection>

      <MarketingSection title="AI Income Check">
        <p>
          AI Income Check reads paystubs, W-2s, 1099s, and bank or investment statements the
          applicant uploads. It looks for a name match and whether the files are the last two
          months.
        </p>
        <p>
          Numbers are read from the upload. Leaseproof does not “verify” income as a consumer
          reporting agency. The landlord still decides.
        </p>
      </MarketingSection>

      <MarketingSection title="Landlord desk">
        <p>
          The desk is a pipeline of homes and applicants. Open a listing, see who applied, and
          approve or decline from the packet. Photo ID, Experian, and AI Income Check tick when
          those pieces are actually on the file.
        </p>
        <p>Background stays off until there is a vendor. We do not invent a clear check.</p>
      </MarketingSection>

      <MarketingCtas />
    </MarketingPage>
  );
}
