import Link from "next/link";
import { BrandMark, BrandWord } from "@/components/brand";
import { DeskSidebar } from "@/components/desk/desk-sidebar";
import { DeskPill, DeskToolbar, PacketWindow } from "@/components/desk/packet-window";
import { PipelineFunnelDemo } from "@/components/demos/pipeline-funnel";
import {
  LyCraigslist,
  LyFacebook,
  LyLead,
  LyLease,
  LyPhone,
  LyPhoto,
  LyRoute,
  LyScreening,
  LyShowings,
  LySyndication,
} from "@/components/demos/ly-widgets";
import { Float } from "@/components/motion/float";
import { InView } from "@/components/motion/in-view";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeadline } from "@/components/motion/section-headline";
import { SplitWords } from "@/components/motion/split-words";
import { Button } from "@/components/ui/button";
import { ListingPhotoStrip } from "@/components/listings/photos";
import { FEATURED_LISTING_ID, getPropertyById } from "@/lib/data/mock-data";

const APPLY_HREF = `/apply/${FEATURED_LISTING_ID}`;
const DESK_HREF = "/dashboard";
const TENANT_HREF = "/tenant";

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

const FLOW_PAIRS = [
  {
    id: "demo-pair-1",
    items: [
      {
        id: "demo-syndicate",
        title: "Marketplace syndication",
        caption: "One Anaheim listing. Destination boards flip to Live.",
        Demo: LySyndication,
      },
      {
        id: "demo-leads",
        title: "Lead / AI chat",
        caption: "Maria texts at 11:52pm. A showing is booked.",
        Demo: LyLead,
      },
    ],
  },
  {
    id: "demo-pair-2",
    items: [
      {
        id: "demo-showings",
        title: "Showing agenda",
        caption: "Tuesday slots fill. Live availability stays on.",
        Demo: LyShowings,
      },
      {
        id: "demo-screen",
        title: "Applicant screening",
        caption: "ID, Experian, income (name + two months), background.",
        Demo: LyScreening,
      },
    ],
  },
  {
    id: "demo-pair-3",
    items: [
      {
        id: "demo-lease",
        title: "Lease signing",
        caption: "Approved → generated → e-sign → deposit queued.",
        Demo: LyLease,
      },
      {
        id: "demo-phone",
        title: "AI phone transcript",
        caption: "Caller asks about 510 S Resh. Agent books Tuesday 2pm.",
        Demo: LyPhone,
      },
    ],
  },
  {
    id: "demo-pair-4",
    items: [
      {
        id: "demo-facebook",
        title: "Facebook Marketplace chat",
        caption: "Maria on Messenger. Instant reply, Anaheim copy.",
        Demo: LyFacebook,
      },
      {
        id: "demo-craigslist",
        title: "Craigslist auto-post",
        caption: "Three listing rows go live. Demo sync.",
        Demo: LyCraigslist,
      },
    ],
  },
  {
    id: "demo-pair-5",
    items: [
      {
        id: "demo-route",
        title: "Smart route planner",
        caption: "Resh St first. Nearby Anaheim stops light in order.",
        Demo: LyRoute,
      },
      {
        id: "demo-photo",
        title: "AI photo enhance",
        caption: "Scan, then the Anaheim living room sharpens.",
        Demo: LyPhoto,
      },
    ],
  },
] as const;

export default function Home() {
  const property = getPropertyById(FEATURED_LISTING_ID)!;

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
          <InView className="hero-copy">
            <h1 id="hero-title">
              <SplitWords>Welcome to the packet.</SplitWords>
            </h1>
            <p className="hero-sub reveal-tone">
              Leaseproof is the screening service that collects applications, runs credit and
              background, and hands you a LeaseScore you can approve or decline.
            </p>
            <div className="hero-ctas reveal-cta">
              <Button asChild size="cta">
                <Link href={DESK_HREF}>Open realtor desk</Link>
              </Button>
              <Button asChild variant="outline" size="cta">
                <Link href={APPLY_HREF}>Apply as renter</Link>
              </Button>
              <Button asChild variant="ghost" size="cta">
                <Link href={TENANT_HREF}>Open tenant desk</Link>
              </Button>
            </div>
          </InView>

          <div className="stage-wrap" id="desk">
            <Float>
              <PacketWindow title="Pipeline • 510 S Resh St" meta="Realtor desk • Demo sync">
                <div className="desk">
                  <DeskSidebar staticActive="Pipeline" />
                  <div className="min-w-0">
                    <DeskToolbar meta="Demo sync">
                      <DeskPill active>Vacant units</DeskPill>
                      <DeskPill>Application review</DeskPill>
                    </DeskToolbar>
                    <PipelineFunnelDemo />
                  </div>
                </div>
              </PacketWindow>
            </Float>
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
              className="reveal-stagger mt-10 grid grid-cols-1 gap-4 lg:grid-cols-3"
            >
              {[
                {
                  lead: "Free Experian screening.",
                  tone: "We securely and verifiably screen applicants via Experian, at no cost to the landlord.",
                },
                {
                  lead: "AI income check.",
                  tone: "Paystubs, W-2s, 1099s, bank and investment statements. Names match the applicant. They’re the last two months.",
                },
                {
                  lead: "One packet everyone can open.",
                  tone: "Filled application, listing photos, Experian, income check, and a LeaseScore. Tenant, realtor, owner — same file.",
                },
              ].map((pillar) => (
                <li key={pillar.lead} className="pillar-spatial">
                  <article className="h-full rounded-lg border border-line bg-paper shadow-window">
                    <div className="p-6 sm:p-7">
                      <h3 className="text-[17px] font-semibold leading-6 tracking-[-0.3px] text-ink">
                        <SplitWords>{pillar.lead}</SplitWords>
                      </h3>
                      <p className="tone reveal-tone mt-2 text-[14px] font-medium leading-5 tracking-[-0.14px] text-mute">
                        {pillar.tone}
                      </p>
                    </div>
                  </article>
                </li>
              ))}
            </InView>
          </div>
        </section>

        <section id="flow" className="bg-white pb-16 sm:pb-28" aria-labelledby="flow-title">
          <div className="mx-auto max-w-shell px-5 sm:px-8">
            <InView>
              <h2
                id="flow-title"
                className="text-[30px] font-medium leading-[1.08] tracking-[-0.6px] text-ink sm:text-[40px] sm:leading-[44px] sm:tracking-[-0.4px]"
              >
                <SplitWords>Vacant unit to signed lease.</SplitWords>
              </h2>
              <p className="reveal-tone mt-3 max-w-[46ch] text-[15px] font-medium leading-6 tracking-[-0.16px] text-mute">
                Syndicate, reply, show, screen, sign. Each pair is one scroll beat. Screening in the
                middle is ours — Experian, AI income, one packet.
              </p>
            </InView>

            {FLOW_PAIRS.map((pair) => (
              <InView key={pair.id} id={pair.id} className="ly-beat">
                <div className="pillar-spatial">
                  <div className="ly-pair">
                    {pair.items.map((item) => (
                      <article key={item.id} id={item.id} className="scroll-mt-24">
                        <div className="ly-kicker">
                          <h3>{item.title}</h3>
                          <p>{item.caption}</p>
                        </div>
                        <item.Demo />
                      </article>
                    ))}
                  </div>
                </div>
              </InView>
            ))}
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
                tone="Landlords do not pay to use the desk. The renter covers screening when they apply."
                className="max-w-[22ch]"
              />
            </InView>

            <InView className="reveal-stagger mt-14 grid grid-cols-1 rounded-lg border border-line bg-paper shadow-window sm:grid-cols-2">
              <article className="reveal-spatial">
                <div className="p-7">
                  <p className="mb-2 text-[14px] font-medium text-mute">Standard</p>
                  <p className="num mb-3 text-[40px] font-medium leading-[44px] tracking-[-0.4px] text-ink">
                    $39.99
                  </p>
                  <p className="max-w-[32ch] text-[15px] font-medium leading-[1.5] text-mute">
                    Credit, criminal, and eviction, sealed into the packet with a LeaseScore.
                  </p>
                </div>
              </article>
              <article className="reveal-spatial">
                <div className="border-t border-line p-7 sm:border-l sm:border-t-0">
                  <p className="mb-2 text-[14px] font-medium text-mute">Premium</p>
                  <p className="num mb-3 text-[40px] font-medium leading-[44px] tracking-[-0.4px] text-ink">
                    $59.99
                  </p>
                  <p className="max-w-[32ch] text-[15px] font-medium leading-[1.5] text-mute">
                    Standard plus income. Employer, stated pay, and rent multiple on the same file.
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
