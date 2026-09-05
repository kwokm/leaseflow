import type { Metadata } from "next";
import Link from "next/link";
import { BetaContactLink } from "@/components/legal/beta-contact";
import { MarketingCtas } from "@/components/marketing/marketing-ctas";
import { MarketingPage, MarketingSection } from "@/components/marketing/marketing-page";
import { LANDLORD_SIGN_UP_HREF } from "@/lib/auth/roles";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Resources — Leaseproof",
  description:
    "How Leaseproof apply links work, how invited landlords get started, and where to read Privacy and Terms.",
};

export default function ResourcesPage() {
  return (
    <MarketingPage kicker="Resources" title="How to start, and where to read the rules.">
      <MarketingSection title="Apply links">
        <p>
          A landlord creates a listing, then shares one apply link for that home. The path looks
          like <span className="text-ink">/apply/{"{listingId}"}</span> — for example, a listing
          id the desk generated, not a public queue.
        </p>
        <p>
          Renters who land on <Link href="/apply" className="text-ink underline underline-offset-4">/apply</Link>{" "}
          without a listing id are asked to get the link from their landlord. There is no open
          apply board.
        </p>
      </MarketingSection>

      <MarketingSection title="Invited landlords">
        <p>
          Sign up first. The desk is invite-only in the Orange County private beta. If your email
          is on the list,{" "}
          <Link href={LANDLORD_SIGN_UP_HREF} className="text-ink underline underline-offset-4">
            create a desk
          </Link>
          , add a listing, and send the apply link.
        </p>
        <p>
          If you were not invited, email <BetaContactLink className="text-ink underline underline-offset-4" />{" "}
          and ask the team to add you.
        </p>
      </MarketingSection>

      <MarketingSection title="Privacy, terms, and consent">
        <p>
          Screening reports are consumer reports under the FCRA. Leaseproof is not legal advice.
          Applicants consent on the apply path before a credit share. Read{" "}
          <Link href="/privacy" className="text-ink underline underline-offset-4">
            Privacy
          </Link>{" "}
          and{" "}
          <Link href="/terms" className="text-ink underline underline-offset-4">
            Terms
          </Link>{" "}
          for how we handle files in this beta.
        </p>
        <p>
          Marketing packets stamp SAMPLE. They are not a live consumer report and not a real
          applicant.
        </p>
      </MarketingSection>

      <MarketingSection title="Contact">
        <p>
          Questions: <BetaContactLink className="text-ink underline underline-offset-4" />.
        </p>
      </MarketingSection>

      <MarketingCtas />
    </MarketingPage>
  );
}
