import Link from "next/link";
import { BrandMark, BrandWord } from "@/components/brand";
import { ApplicationTable } from "@/components/desk/application-table";
import { DeskSidebar } from "@/components/desk/desk-sidebar";
import { DeskPill, DeskToolbar, PacketWindow } from "@/components/desk/packet-window";
import { PageWash } from "@/components/page-wash";
import { Button } from "@/components/ui/button";
import { deskHeroApplicants } from "@/lib/desk/display";
import { getPropertyById } from "@/lib/data/mock-data";

const DEMO_LISTING_ID = "prop-1";
const APPLY_HREF = `/apply/${DEMO_LISTING_ID}`;
const DESK_HREF = "/dashboard";

function Headline({
  lead,
  tone,
  className = "",
  id,
}: {
  lead: string;
  tone: string;
  className?: string;
  id?: string;
}) {
  return (
    <h2
      id={id}
      className={`text-[30px] font-medium leading-[1.08] tracking-[-0.6px] text-ink sm:text-[40px] sm:leading-[44px] sm:tracking-[-0.4px] ${className}`}
    >
      {lead} <span className="tone">{tone}</span>
    </h2>
  );
}

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
    <div className="relative min-h-screen">
      <PageWash />

      <a href="#main" className="skip-link">
        Skip to content
      </a>

      <header className="relative z-50">
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
                className="text-[14px] font-medium tracking-[-0.2px] text-mute transition-colors duration-160 ease-premium hover:text-ink"
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

      <main id="main" className="relative z-10">
        <section className="pt-16 sm:pt-[88px]" aria-labelledby="hero-title">
          <div className="mx-auto mb-[52px] max-w-[860px] px-5 text-center sm:px-8">
            <h1
              id="hero-title"
              className="text-[clamp(40px,5.6vw,80px)] font-semibold leading-[0.95] tracking-[-1.12px] text-ink xl:tracking-[-2.4px]"
            >
              Welcome to the packet.
            </h1>

            <p className="mx-auto mt-[18px] max-w-[34rem] text-[16px] font-medium leading-[20.8px] tracking-[-0.17px] text-mute">
              LeaseFlow is the screening service that collects applications, runs credit and
              background, and hands you a LeaseScore you can approve or decline.
            </p>

            <div className="mt-7 flex flex-wrap justify-center gap-2.5">
              <Button asChild size="cta">
                <Link href={DESK_HREF}>Open the desk</Link>
              </Button>
              <Button asChild variant="outline" size="cta">
                <Link href={APPLY_HREF}>Apply as renter</Link>
              </Button>
            </div>
          </div>

          <div className="mx-auto max-w-shell px-5 pb-20 sm:px-8" id="desk">
            <PacketWindow title="Application packet • 742 Evergreen Terrace">
              <div className="grid min-h-[420px] grid-cols-1 bg-paper sm:grid-cols-[196px_minmax(0,1fr)]">
                <DeskSidebar staticActive="Applications" />
                <div className="min-w-0">
                  <DeskToolbar meta="3 in queue">
                    <DeskPill active>All properties</DeskPill>
                    <DeskPill active>Received</DeskPill>
                  </DeskToolbar>
                  <ApplicationTable rows={heroRows} packetLinks />
                </div>
              </div>
            </PacketWindow>
          </div>
        </section>

        <section id="platform" className="pb-16 sm:pb-28" aria-labelledby="platform-title">
          <div className="mx-auto max-w-shell px-5 sm:px-8">
            <p className="mb-[18px] inline-flex h-6 items-center rounded-full bg-fill px-2.5 text-[13px] font-medium tracking-[-0.16px] text-fill-text">
              Preview
            </p>
            <Headline
              id="platform-title"
              lead="The desk that finishes the file."
              tone="Applicants pay. The packet lands scored. You approve or decline."
              className="max-w-[28ch]"
            />
          </div>
        </section>

        <section className="pb-16 sm:pb-24" aria-labelledby="how-title">
          <div className="mx-auto max-w-shell px-5 sm:px-8">
            <Headline
              id="how-title"
              lead="Four steps, start to decision."
              tone="Most applications complete in about ten minutes."
              className="max-w-3xl"
            />

            <ol className="mt-10 grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-line bg-line shadow-window sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((step) => (
                <li key={step.n} className="bg-paper p-6">
                  <p className="num text-[13px] font-medium text-mute-2">{step.n}</p>
                  <p className="mt-3 text-[17px] font-semibold leading-6 tracking-[-0.3px] text-ink">
                    {step.lead}
                  </p>
                  <p className="mt-1.5 text-[14px] font-medium leading-5 tracking-[-0.14px] text-mute">
                    {step.tone}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="rates" className="pb-16 sm:pb-28" aria-labelledby="rates-title">
          <div className="mx-auto max-w-shell px-5 sm:px-8">
            <p className="mb-3.5 text-[13px] font-medium tracking-[-0.13px] text-mute">Fees</p>
            <Headline
              id="rates-title"
              lead="Applicants pay the fee."
              tone="Landlords do not pay to use the desk. The renter covers screening when they apply."
              className="max-w-[22ch]"
            />

            <div className="mt-14 grid grid-cols-1 overflow-hidden rounded-lg border border-line bg-paper shadow-window sm:grid-cols-2">
              <article className="p-7">
                <p className="mb-2 text-[14px] font-medium text-mute">Standard</p>
                <p className="num mb-3 text-[40px] font-medium leading-[44px] tracking-[-0.4px] text-ink">
                  $39.99
                </p>
                <p className="max-w-[32ch] text-[15px] font-medium leading-[1.5] text-mute">
                  Credit, criminal, and eviction, sealed into the packet with a LeaseScore.
                </p>
              </article>
              <article className="border-t border-line p-7 sm:border-l sm:border-t-0">
                <p className="mb-2 text-[14px] font-medium text-mute">Premium</p>
                <p className="num mb-3 text-[40px] font-medium leading-[44px] tracking-[-0.4px] text-ink">
                  $59.99
                </p>
                <p className="max-w-[32ch] text-[15px] font-medium leading-[1.5] text-mute">
                  Standard plus income. Employer, stated pay, and rent multiple on the same file.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section id="apply" className="pb-20" aria-labelledby="apply-title">
          <div className="mx-auto max-w-shell px-5 sm:px-8">
            <PacketWindow title={`Apply • ${property.address.split(",")[0]}`}>
              <div className="flex flex-col gap-5 px-6 py-7 md:flex-row md:items-center md:justify-between">
                <div>
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
                <Button asChild size="cta" className="shrink-0">
                  <Link href={APPLY_HREF}>Apply as renter</Link>
                </Button>
              </div>
            </PacketWindow>
          </div>
        </section>
      </main>

      <footer id="legal" className="relative z-10 pb-10 pt-6 text-mute">
        <div className="mx-auto flex max-w-shell flex-col gap-6 px-5 sm:px-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2.5 text-ink">
            <BrandMark size={20} />
            <BrandWord />
          </div>
          <p className="max-w-xl text-[12px] font-medium leading-5 text-mute">
            Screening reports are consumer reports under the FCRA. This site is a prototype — names,
            scores, and tradelines are mock data, and no consumer reporting agency is used.
          </p>
        </div>
      </footer>
    </div>
  );
}
