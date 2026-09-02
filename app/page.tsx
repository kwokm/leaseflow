import Link from "next/link";
import "../components/desk/landing-stage.css";
import { BrandMark, BrandWord } from "@/components/brand";
import { PacketWindow } from "@/components/desk/packet-window";
import { HeroDesk } from "@/components/desk/hero-desk";
import { HeroPacket } from "@/components/desk/hero-packet";
import { InView } from "@/components/motion/in-view";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeadline } from "@/components/motion/section-headline";
import { SplitWords } from "@/components/motion/split-words";
import { Button } from "@/components/ui/button";
import { ListingPhotoStrip } from "@/components/listings/photos";
import { PillarExperian, PillarIncome, PillarPacket } from "@/components/demos/pillar-demos";
import { LANDLORD_SIGN_IN_HREF } from "@/lib/auth/roles";
import { FEATURED_LISTING_ID, demoPropertyById } from "@/lib/data/mock-data";

const APPLY_HREF = `/apply/${FEATURED_LISTING_ID}`;

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

export default function Home() {
  const property = demoPropertyById(FEATURED_LISTING_ID)!;

  return (
    <div className="min-h-screen bg-white">
      <a href="#main" className="skip-link">
        Skip to content
      </a>

      <header className="relative z-50 bg-white">
        <div className="mx-auto flex h-16 max-w-header items-center gap-9 px-5 sm:px-8 lg:px-14">
          <Link
            href="/"
            aria-label="Leaseproof home"
            className="flex shrink-0 items-center gap-2.5 text-ink"
          >
            <BrandMark />
            <BrandWord />
          </Link>

          <nav aria-label="Primary" className="hidden flex-1 items-center gap-7 md:flex">
            {[
              { href: "#platform", label: "Platform" },
              { href: "#rates", label: "Pricing" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-[14px] font-medium tracking-[-0.2px] text-mute transition-colors duration-200 ease-out hover:text-ink"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <Button asChild variant="ghost">
              <Link href={LANDLORD_SIGN_IN_HREF}>Sign in / Sign up</Link>
            </Button>
          </div>
        </div>
      </header>

      <main id="main">
        <section className="hero" id="top" aria-labelledby="hero-title">
          <div className="hero-wash" aria-hidden />
          <InView className="hero-copy">
            <h1 id="hero-title">
              <SplitWords>We screen, verify, and organize your lease for you</SplitWords>
            </h1>
            <p className="hero-sub reveal-tone">
              Leaseproof is the screening service that collects applications, runs
              credit and background checks, and utilizes AI to fully verify and
              approve all income and bank statements
            </p>
            <div className="hero-ctas reveal-cta">
              <Button asChild variant="lilac" size="cta">
                <Link href="/dashboard">Screen as Landlord</Link>
              </Button>
              <Button asChild variant="outline" size="cta">
                <Link href={APPLY_HREF}>Apply as renter</Link>
              </Button>
            </div>
          </InView>

          <div className="stage-wrap" id="packet">
            <HeroPacket />
          </div>
        </section>

        <section id="pillars" className="bg-white pb-16 sm:pb-28" aria-labelledby="pillars-title">
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
              {[
                {
                  lead: "Experian screening included.",
                  tone: "Applicants pay $24.99; Experian is included, $0 extra for landlords.",
                  Demo: PillarExperian,
                },
                {
                  lead: "AI income check.",
                  tone: "Paystubs, W-2s, 1099s, bank and investment statements. Names match the applicant. They’re the last two months.",
                  Demo: PillarIncome,
                },
                {
                  lead: "One packet everyone can open.",
                  tone: "Filled application, listing photos, Experian, income check, and a LeaseScore. Tenant, realtor, owner — same file.",
                  Demo: PillarPacket,
                },
              ].map((pillar) => (
                <li key={pillar.lead} className="pillar-spatial flex flex-col gap-4">
                  <article className="rounded-lg border border-line bg-paper shadow-window">
                    <div className="p-6 sm:p-7">
                      <h3 className="text-[17px] font-semibold leading-6 tracking-[-0.3px] text-ink">
                        <SplitWords>{pillar.lead}</SplitWords>
                      </h3>
                      <p className="tone reveal-tone mt-2 text-[14px] font-medium leading-5 tracking-[-0.14px] text-mute">
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

        <section id="platform" className="bg-white pb-16 sm:pb-28" aria-labelledby="platform-title">
          <InView className="mx-auto max-w-shell px-5 sm:px-8">
            <p className="reveal-block reveal-shift-sm mb-[18px] text-[13px] font-medium tracking-[-0.13px] text-mute">
              Platform
            </p>
            <SectionHeadline
              id="platform-title"
              lead="The desk that finishes the file."
              tone="Applicants pay. The packet lands scored. You approve or decline."
              className="max-w-[28ch]"
            />
          </InView>
          <InView className="platform-desk mt-10">
            <HeroDesk quiet />
          </InView>
        </section>

        <section className="pb-16 sm:pb-24" aria-labelledby="how-title">
          <div className="mx-auto max-w-shell px-5 sm:px-8">
            <InView>
              <SectionHeadline
                id="how-title"
                lead="Four steps, start to decision."
                tone="Most applications complete in about ten minutes."
                className="max-w-3xl"
              />
            </InView>

            <InView
              as="ol"
              className="reveal-stagger mt-10 grid grid-cols-1 gap-px rounded-lg border border-line bg-line shadow-window sm:grid-cols-2 lg:grid-cols-4"
            >
              {STEPS.map((step) => (
                <li key={step.n} className="reveal-spatial">
                  <div className="bg-paper p-6">
                    <p className="num text-[13px] font-medium text-mute-2">{step.n}</p>
                    <p className="mt-3 text-[17px] font-semibold leading-6 tracking-[-0.3px] text-ink">
                      {step.lead}
                    </p>
                    <p className="mt-1.5 text-[14px] font-medium leading-5 tracking-[-0.14px] text-mute">
                      {step.tone}
                    </p>
                  </div>
                </li>
              ))}
            </InView>
          </div>
        </section>

        <section id="rates" className="pb-16 sm:pb-28" aria-labelledby="rates-title">
          <div className="mx-auto max-w-shell px-5 sm:px-8">
            <InView>
              <p className="reveal-block reveal-shift-sm mb-3.5 text-[13px] font-medium tracking-[-0.13px] text-mute">
                Fees
              </p>
              <SectionHeadline
                id="rates-title"
                lead="Applicants pay the fee."
                tone="Applicants pay $24.99; Experian is included, $0 extra for landlords."
                className="max-w-[22ch]"
              />
            </InView>

            <InView className="reveal-stagger mt-14 max-w-xl">
              <article className="reveal-spatial overflow-hidden rounded-lg border border-line bg-wash/40 shadow-window">
                <div className="p-7">
                  <p className="mb-2 text-[14px] font-medium text-mute">Standard</p>
                  <p className="num mb-3 text-[40px] font-medium leading-[44px] tracking-[-0.4px] text-ink">
                    $24.99
                  </p>
                  <p className="max-w-[40ch] text-[15px] font-medium leading-[1.5] text-mute">
                    Includes everything — credit, background, ID, AI income and bank verification,
                    and the packet. Apply to as many homes as you want on this one fee.
                  </p>
                  <p className="mt-3 max-w-[40ch] text-[14px] font-medium leading-[1.45] text-mute">
                    Applicants pay $24.99; Experian is included, $0 extra for landlords.
                  </p>
                </div>
              </article>
            </InView>
          </div>
        </section>

        <section id="apply" className="pb-20" aria-labelledby="apply-title">
          <InView className="mx-auto max-w-shell px-5 sm:px-8">
            <div className="reveal-spatial">
              <PacketWindow title={`Apply • ${property.address.split(",")[0]}`}>
                <div className="flex flex-col gap-5 px-6 py-7 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium tracking-[-0.13px] text-mute">For renters</p>
                    <h2
                      id="apply-title"
                      className="mt-2 text-[24px] font-medium leading-[27.6px] tracking-[-0.24px] text-ink"
                    >
                      Apply for {property.address.split(",")[0]}
                    </h2>
                    <p className="mt-1.5 text-[14px] font-medium text-mute">
                      {property.bedrooms} bedroom · {property.bathrooms} bath ·{" "}
                      <span className="num">${property.rent.toLocaleString()}</span> per month · you
                      pay the screening fee.
                    </p>
                    <div className="mt-3">
                      <ListingPhotoStrip photos={property.photos} alt={property.address} />
                    </div>
                  </div>
                  <Button asChild size="cta" className="shrink-0">
                    <Link href={APPLY_HREF}>Apply as renter</Link>
                  </Button>
                </div>
              </PacketWindow>
            </div>
          </InView>
        </section>
      </main>

      <footer id="legal" className="relative z-10 pb-10 pt-6 text-mute">
        <Reveal
          shift="sm"
          className="mx-auto flex max-w-shell flex-col gap-6 px-5 sm:px-8 md:flex-row md:items-center md:justify-between"
        >
          <div className="flex items-center gap-2.5 text-ink">
            <BrandMark size={20} />
            <BrandWord />
          </div>
          <p className="max-w-xl text-[12px] font-medium leading-5 text-mute">
            Screening reports are consumer reports under the FCRA. This site is a prototype — names,
            scores, and tradelines are mock data, and no consumer reporting agency is used. Leaseproof
            is a working name, not a live trademark claim.
          </p>
        </Reveal>
      </footer>
    </div>
  );
}
