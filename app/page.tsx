import Link from "next/link";
import { BrandMark, BrandWord } from "@/components/brand";
import { ApplicationTable } from "@/components/desk/application-table";
import { DeskSidebar } from "@/components/desk/desk-sidebar";
import { DeskPill, DeskToolbar, PacketWindow } from "@/components/desk/packet-window";
import { Float } from "@/components/motion/float";
import { InView } from "@/components/motion/in-view";
import { Reveal, RevealItem, RevealStagger } from "@/components/motion/reveal";
import { SectionHeadline } from "@/components/motion/section-headline";
import { Button } from "@/components/ui/button";
import { deskHeroApplicants } from "@/lib/desk/display";
import { getPropertyById } from "@/lib/data/mock-data";

const DEMO_LISTING_ID = "prop-1";
const APPLY_HREF = `/apply/${DEMO_LISTING_ID}`;
const DESK_HREF = "/dashboard";

const STEPS = [
  {
    n: "01",
    lead: "Add the listing.",
    tone: "Address, rent, and which package applicants pay for.",
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
  const property = getPropertyById(DEMO_LISTING_ID)!;
  const heroRows = deskHeroApplicants();

  return (
    <div className="min-h-screen bg-white">
      <a href="#main" className="skip-link">
        Skip to content
      </a>

      <header className="relative z-50 bg-white">
        <div className="mx-auto flex h-16 max-w-header items-center gap-9 px-5 sm:px-8 lg:px-14">
          <Link
            href="/"
            aria-label="LeaseFlow home"
            className="flex shrink-0 items-center gap-2.5 text-ink"
          >
            <BrandMark />
            <BrandWord />
          </Link>

          <nav aria-label="Primary" className="hidden flex-1 items-center gap-7 md:flex">
            {[
              { href: "#platform", label: "Platform" },
              { href: "#apply", label: "Resources" },
              { href: "#desk", label: "Customers" },
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
              <Link href={DESK_HREF}>Sign in</Link>
            </Button>
            <Button asChild>
              <Link href={DESK_HREF}>Start for free</Link>
            </Button>
          </div>
        </div>
      </header>

      <main id="main">
        <section className="hero" id="top" aria-labelledby="hero-title">
          <div className="hero-wash" aria-hidden />
          <div className="hero-copy">
            <h1 id="hero-title">Welcome to the packet.</h1>
            <p className="hero-sub">
              LeaseFlow is the screening service that collects applications, runs credit and
              background, and hands you a LeaseScore you can approve or decline.
            </p>
            <div className="hero-ctas">
              <Button asChild size="cta">
                <Link href={DESK_HREF}>Open the desk</Link>
              </Button>
              <Button asChild variant="outline" size="cta">
                <Link href={APPLY_HREF}>Apply as renter</Link>
              </Button>
            </div>
          </div>

          <div className="stage-wrap" id="desk">
            <Float>
              <PacketWindow title="Application packet • 742 Evergreen Terrace" meta="Desk • 3 files">
                <div className="desk">
                  <DeskSidebar staticActive="Applications" />
                  <div className="min-w-0">
                    <DeskToolbar meta="3 in queue">
                      <DeskPill active>All properties</DeskPill>
                      <DeskPill>Received</DeskPill>
                    </DeskToolbar>
                    <ApplicationTable rows={heroRows} packetLinks selectedId="app-1" />
                  </div>
                </div>
              </PacketWindow>
            </Float>
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

            <RevealStagger
              as="ol"
              className="mt-10 grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-line bg-line shadow-window sm:grid-cols-2 lg:grid-cols-4"
            >
              {STEPS.map((step) => (
                <RevealItem key={step.n} as="li" className="bg-paper p-6">
                  <p className="num text-[13px] font-medium text-mute-2">{step.n}</p>
                  <p className="mt-3 text-[17px] font-semibold leading-6 tracking-[-0.3px] text-ink">
                    {step.lead}
                  </p>
                  <p className="mt-1.5 text-[14px] font-medium leading-5 tracking-[-0.14px] text-mute">
                    {step.tone}
                  </p>
                </RevealItem>
              ))}
            </RevealStagger>
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
                tone="Landlords do not pay to use the desk. The renter covers screening when they apply."
                className="max-w-[22ch]"
              />
            </InView>

            <RevealStagger className="mt-14 grid grid-cols-1 overflow-hidden rounded-lg border border-line bg-paper shadow-window sm:grid-cols-2">
              <RevealItem as="article" className="p-7">
                <p className="mb-2 text-[14px] font-medium text-mute">Standard</p>
                <p className="num mb-3 text-[40px] font-medium leading-[44px] tracking-[-0.4px] text-ink">
                  $39.99
                </p>
                <p className="max-w-[32ch] text-[15px] font-medium leading-[1.5] text-mute">
                  Credit, criminal, and eviction, sealed into the packet with a LeaseScore.
                </p>
              </RevealItem>
              <RevealItem
                as="article"
                className="border-t border-line p-7 sm:border-l sm:border-t-0"
              >
                <p className="mb-2 text-[14px] font-medium text-mute">Premium</p>
                <p className="num mb-3 text-[40px] font-medium leading-[44px] tracking-[-0.4px] text-ink">
                  $59.99
                </p>
                <p className="max-w-[32ch] text-[15px] font-medium leading-[1.5] text-mute">
                  Standard plus income. Employer, stated pay, and rent multiple on the same file.
                </p>
              </RevealItem>
            </RevealStagger>
          </div>
        </section>

        <section id="apply" className="pb-20" aria-labelledby="apply-title">
          <InView className="mx-auto max-w-shell px-5 sm:px-8">
            <PacketWindow title={`Apply • ${property.address.split(",")[0]}`}>
              <div className="flex flex-col gap-5 px-6 py-7 md:flex-row md:items-center md:justify-between">
                <div className="reveal-block reveal-shift-lg">
                  <p className="text-[13px] font-medium tracking-[-0.13px] text-mute">For renters</p>
                  <h2
                    id="apply-title"
                    className="mt-2 text-[24px] font-medium leading-[27.6px] tracking-[-0.24px] text-ink"
                  >
                    Apply for {property.address.split(",")[0]}
                  </h2>
                  <p className="mt-1.5 text-[14px] font-medium text-mute">
                    {property.bedrooms} bedroom ·{" "}
                    <span className="num">${property.rent.toLocaleString()}</span> per month · you
                    pay the screening fee.
                  </p>
                </div>
                <div className="reveal-cta shrink-0">
                  <Button asChild size="cta">
                    <Link href={APPLY_HREF}>Apply as renter</Link>
                  </Button>
                </div>
              </div>
            </PacketWindow>
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
            scores, and tradelines are mock data, and no consumer reporting agency is used.
          </p>
        </Reveal>
      </footer>
    </div>
  );
}
