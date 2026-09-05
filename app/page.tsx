import Link from "next/link";
import "../components/desk/landing-stage.css";
import { PacketWindow } from "@/components/desk/packet-window";
import { HeroStage } from "@/components/desk/hero-stage";
import { SiteHeader } from "@/components/site-header";
import { PillarExperian, PillarIncome, PillarPacket } from "@/components/demos/pillar-demos";
import { InView } from "@/components/motion/in-view";
import { SplitWords } from "@/components/motion/split-words";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { ListingPhotoStrip } from "@/components/listings/photos";
import { applyAsRenterHref } from "@/lib/apply/public-cta";
import { LANDLORD_SIGN_IN_HREF } from "@/lib/auth/roles";
import { isDemoMode } from "@/lib/config/env";
import { FEATURED_LISTING_ID, demoPropertyById } from "@/lib/data/mock-data";

/** Apply CTA depends on LEASEPROOF_DEMO — do not bake a listing href at build. */
export const dynamic = "force-dynamic";

const STEPS = [
  {
    n: "01",
    lead: "Add the listing.",
    tone: "Address, rent, and the Standard screening fee applicants pay.",
  },
  { n: "02", lead: "Share the link.", tone: "One link per listing, by text or email." },
  {
    n: "03",
    lead: "They apply.",
    tone: "ID, pay stubs, bank statements, and a credit pull in about ten minutes.",
  },
  {
    n: "04",
    lead: "You decide.",
    tone: "The packet lands scored. Approve or decline from the row.",
  },
];

const PILLARS = [
  {
    lead: "Experian screening included.",
    tone: "Applicants pay $24.99; Experian is included, $0 extra for landlords.",
    Demo: PillarExperian,
  },
  {
    lead: "AI Income Check.",
    tone: "Paystubs, W-2s, 1099s, bank and investment statements. Names match the applicant. They’re the last two months.",
    Demo: PillarIncome,
  },
  {
    lead: "One packet everyone can open.",
    tone: "Filled application, listing photos, Experian, income check, and a LeaseScore. Tenant, landlord, owner — same file.",
    Demo: PillarPacket,
  },
];

export default function Home() {
  const demo = isDemoMode();
  const applyHref = applyAsRenterHref(demo);
  const property = demoPropertyById(FEATURED_LISTING_ID)!;

  return (
    <div className="bg-white">
      <a href="#main" className="skip-link">
        Skip to content
      </a>

      <SiteHeader />

      <main id="main">
        <section className="hero" id="top" aria-labelledby="hero-title">
          <div className="hero-shell">
            <InView className="hero-copy">
              <h1 id="hero-title">
                <span className="hero-line">We screen and organize</span>
                <span className="hero-line">the packet. You decide.</span>
              </h1>
              <p className="hero-sub reveal-tone">
                AI Income Check and Experian included. Applicants pay $24.99. The
                landlord decides.
              </p>
              <div className="hero-ctas reveal-cta">
                <Button asChild variant="lilac" size="cta">
                  <Link href={LANDLORD_SIGN_IN_HREF}>Screen as Landlord</Link>
                </Button>
                <Button asChild variant="outline" size="cta">
                  <Link href={applyHref}>Apply as renter</Link>
                </Button>
              </div>
            </InView>

            <div className="stage-wrap" id="packet">
              <HeroStage />
            </div>
          </div>
        </section>

        <section className="pb-10 sm:pb-14" aria-labelledby="how-title">
          <div className="mx-auto max-w-shell px-5 sm:px-8">
            <InView>
              <h2
                id="how-title"
                className="text-[16px] font-medium leading-[22px] tracking-[-0.16px] text-ink"
              >
                Four steps, start to decision.
              </h2>
              <p className="mt-1 text-[16px] font-medium leading-[22px] text-mute">
                Most applications complete in about ten minutes.
              </p>
            </InView>

            <InView
              as="ol"
              className="reveal-stagger mt-6 grid grid-cols-1 gap-px rounded-lg border border-line bg-line shadow-window sm:grid-cols-2 lg:grid-cols-4"
            >
              {STEPS.map((step) => (
                <li key={step.n} className="reveal-spatial">
                  <div className="bg-paper p-5">
                    <p className="num text-[13px] font-medium text-mute">{step.n}</p>
                    <p className="mt-2 text-[16px] font-medium leading-[22px] tracking-[-0.16px] text-ink">
                      {step.lead}
                    </p>
                    <p className="mt-1 text-[13px] font-medium leading-5 text-mute">
                      {step.tone}
                    </p>
                  </div>
                </li>
              ))}
            </InView>

            <p className="mt-5 text-[16px] font-medium leading-[22px] text-mute">
              Applicants pay $24.99; Experian included, $0 extra for landlords.
            </p>
          </div>
        </section>

        <section id="pillars" className="bg-white pb-12 sm:pb-16" aria-labelledby="pillars-title">
          <div className="mx-auto max-w-shell px-5 sm:px-8">
            <InView>
              <h2
                id="pillars-title"
                className="text-[30px] font-medium leading-[1.08] tracking-[-0.6px] text-ink sm:text-[40px] sm:leading-[44px] sm:tracking-[-0.4px]"
              >
                <SplitWords>What we do best.</SplitWords>
              </h2>
            </InView>

            <InView
              as="ul"
              className="reveal-stagger mt-10 grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-8"
            >
              {PILLARS.map((pillar) => (
                <li key={pillar.lead} className="pillar-spatial flex flex-col gap-4">
                  <article className="rounded-lg border border-line bg-paper shadow-window">
                    <div className="p-6 sm:p-7">
                      <h3 className="text-[16px] font-medium leading-[22px] tracking-[-0.16px] text-ink">
                        <SplitWords>{pillar.lead}</SplitWords>
                      </h3>
                      <p className="tone reveal-tone mt-2 text-[13px] font-medium leading-5 text-mute">
                        {pillar.tone}
                      </p>
                    </div>
                  </article>
                  <pillar.Demo />
                </li>
              ))}
            </InView>
          </div>
        </section>

        <section id="apply" className="pb-8" aria-labelledby="apply-title">
          <div className="mx-auto max-w-shell px-5 sm:px-8">
            {demo ? (
              <PacketWindow title={`Apply • ${property.address.split(",")[0]}`}>
                <div className="flex flex-col gap-5 px-6 py-7 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium tracking-[-0.13px] text-mute">For renters</p>
                    <h2
                      id="apply-title"
                      className="mt-2 text-[16px] font-medium leading-[22px] tracking-[-0.16px] text-ink"
                    >
                      Apply for {property.address.split(",")[0]}
                    </h2>
                    <p className="mt-1.5 text-[16px] font-medium leading-[22px] text-mute">
                      {property.bedrooms} bedroom · {property.bathrooms} bath ·{" "}
                      <span className="num">${property.rent.toLocaleString()}</span> per month · you
                      pay the screening fee.
                    </p>
                    <div className="mt-3">
                      <ListingPhotoStrip photos={property.photos} alt={property.address} />
                    </div>
                  </div>
                  <Button asChild size="cta" className="shrink-0">
                    <Link href={applyHref}>Apply as renter</Link>
                  </Button>
                </div>
              </PacketWindow>
            ) : (
              <PacketWindow title="Apply">
                <div className="flex flex-col gap-5 px-6 py-7 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium tracking-[-0.13px] text-mute">For renters</p>
                    <h2
                      id="apply-title"
                      className="mt-2 text-[16px] font-medium leading-[22px] tracking-[-0.16px] text-ink"
                    >
                      Get a link from your landlord
                    </h2>
                    <p className="mt-1.5 text-[16px] font-medium leading-[22px] text-mute">
                      Applications open from a listing your landlord shares. There is no public
                      apply queue.
                    </p>
                  </div>
                  <Button asChild size="cta" className="shrink-0">
                    <Link href={applyHref}>Apply as renter</Link>
                  </Button>
                </div>
              </PacketWindow>
            )}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
