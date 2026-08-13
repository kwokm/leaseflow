import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BrandMark, BrandWord } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { getPropertyById } from "@/lib/data/mock-data";

// Every renter-facing CTA points at the demo listing's application.
const DEMO_LISTING_ID = "prop-1";
const APPLY_HREF = `/apply/${DEMO_LISTING_ID}`;

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

const REVIEWS = [
  {
    time: "10:00 – 10:20",
    initials: "SJ",
    ava: "bg-[#e8e4f4] text-[#3d3558]",
    name: "Sarah Johnson packet",
    meta: "742 Evergreen Terrace · LeaseScore 785",
    status: "Completed",
    statusTone: "",
    open: true,
    bits: ["Credit 742", "Criminal clear", "Eviction none", "Income 2.6×"],
  },
  {
    time: "11:30 – 11:50",
    initials: "ER",
    ava: "bg-[#ece8f2] text-[#3f3a4d]",
    name: "Emily Rodriguez",
    meta: "123 Main Street 4B · LeaseScore 820",
    status: "Approved",
    statusTone: "bg-ok-bg text-ok",
    open: false,
    bits: [],
  },
  {
    time: "2:00 – 2:20",
    initials: "JW",
    ava: "bg-[#e8e8ec] text-[#3f3f46]",
    name: "James Wilson",
    meta: "742 Evergreen Terrace · LeaseScore 580",
    status: "Declined",
    statusTone: "bg-no-bg text-no",
    open: false,
    bits: [],
  },
];

const RAIL = ["Home", "Applications", "Payments", "Messages", "Properties"];

const LOGO_CELLS = [
  "742 Evergreen",
  "123 Main 4B",
  "456 Oak Ave",
  "88 Pine Court",
  "210 Maple",
  "Credit",
  "Criminal",
  "Eviction",
  "Income",
  "Identity",
  "Standard",
  "Premium",
  "LeaseScore",
  "Packet",
  "Desk",
];

const PLATFORM_CARDS = [
  {
    kicker: "Applications",
    lead: "The queue, in one place.",
    tone: "Completed packets land on the desk in the order they finish.",
  },
  {
    kicker: "Packets",
    lead: "The file stays together.",
    tone: "Credit, ID, pay stubs, and bank statements seal into one packet.",
  },
  {
    kicker: "Fees",
    lead: "Applicants cover screening.",
    tone: "Standard $39.99. Premium $59.99 with income verification.",
  },
  {
    kicker: "Reports",
    lead: "Read what came back.",
    tone: "Each slice of the packet opens straight from the row.",
  },
];

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

const SLICES = [
  {
    kicker: "Credit",
    lead: "Score, tradelines, and how the file is trending.",
    rows: [
      ["Score", "785"],
      ["On-time payments", "98%"],
      ["Derogatory marks", "0"],
    ],
  },
  {
    kicker: "Criminal",
    lead: "National and county-level search, or nothing on file.",
    rows: [
      ["Result", "No records"],
      ["Sources", "National + county"],
      ["Registry", "Clear"],
    ],
  },
  {
    kicker: "Eviction",
    lead: "Filings and judgments, or none on file.",
    rows: [
      ["Result", "No filings"],
      ["Courts", "County"],
      ["Look-back", "7 years"],
    ],
  },
  {
    kicker: "Income",
    lead: "Employer, stated pay, and how it sits against rent.",
    rows: [
      ["Employer", "Tech Solutions"],
      ["Stated", "$9,500 / mo"],
      ["Rent multiple", "4.0×"],
    ],
  },
];

export default function Home() {
  const property = getPropertyById(DEMO_LISTING_ID)!;

  return (
    <div className="min-h-screen bg-paper">
      <a href="#main" className="skip-link">
        Skip to content
      </a>

      <div className="sticky top-0 z-50">
        <div className="flex h-9 items-center justify-center bg-dark px-11 text-center">
          <p className="text-[13px] font-medium leading-tight tracking-[-0.18px] text-white">
            Applicant-paid packets. Landlords use the desk free →
          </p>
        </div>

        <header className="border-b border-line bg-paper/95 backdrop-blur">
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
                  className="text-[14px] font-medium tracking-[-0.2px] text-ink-2 transition-colors duration-160 ease-premium hover:text-ink"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="ml-auto flex items-center gap-2">
              <Button asChild variant="outline">
                <Link href="/dashboard">Sign in</Link>
              </Button>
              <Button asChild>
                <Link href={APPLY_HREF}>Start for free</Link>
              </Button>
            </div>
          </div>
        </header>
      </div>

      <main id="main">
        {/* Hero */}
        <section className="relative overflow-hidden bg-paper pt-[88px]" aria-labelledby="hero-title">
          <div className="hero-wash" aria-hidden />

          <div className="relative z-10 mx-auto mb-[52px] max-w-[860px] px-5 text-center sm:px-8">
            <Link
              href="#desk"
              className="mb-5 inline-flex h-[30px] items-center rounded-full border border-line-2 bg-paper px-3 text-[13px] font-medium tracking-[-0.18px] text-ink transition-[border-color] duration-160 ease-premium hover:border-mute-3"
            >
              How landlords review a packet →
            </Link>

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
              <Button asChild variant="outline" size="cta">
                <Link href={APPLY_HREF}>Apply as renter</Link>
              </Button>
              <Button asChild size="cta">
                <Link href={APPLY_HREF}>Start for free</Link>
              </Button>
            </div>
          </div>

          <div className="relative z-10 mx-auto max-w-shell px-5 pb-20 sm:px-8" id="desk">
            <div className="overflow-hidden rounded-lg border border-line bg-paper shadow-window">
              <div className="flex h-10 items-center gap-[7px] border-b border-line bg-[#fafafa] px-3.5">
                <span className="h-3 w-3 rounded-full bg-[#E15C6B]" aria-hidden />
                <span className="h-3 w-3 rounded-full bg-[#F5B400]" aria-hidden />
                <span className="h-3 w-3 rounded-full bg-[#12A150]" aria-hidden />
              </div>

              <div className="grid min-h-[480px] grid-cols-1 bg-paper sm:grid-cols-[196px_minmax(0,1fr)]">
                <aside className="hidden flex-col gap-0.5 border-r border-line bg-rail p-2 pt-2.5 sm:flex">
                  <div className="mb-2 flex h-[34px] items-center justify-between rounded-md px-2.5 text-[13px] font-semibold tracking-[-0.26px] text-ink">
                    Evergreen desk
                    <span className="text-mute-2" aria-hidden>
                      ▾
                    </span>
                  </div>
                  {RAIL.map((item, index) => (
                    <span
                      key={item}
                      className={`flex h-[34px] items-center rounded-md px-2.5 text-[13px] font-medium ${
                        index === 0 ? "bg-paper text-ink shadow-[0_1px_2px_rgba(17,17,20,0.06)]" : "text-mute"
                      }`}
                    >
                      {item}
                    </span>
                  ))}
                </aside>

                <div className="flex min-w-0 flex-col">
                  <div className="flex h-11 items-center justify-between border-b border-line px-[22px] text-[13px] font-medium text-ink-2">
                    <span>Home</span>
                    <span className="text-mute-2">Help</span>
                  </div>

                  <div className="min-w-0 px-7 py-7">
                    <p className="text-[32px] font-semibold leading-[1.1] tracking-[-0.04em] text-ink">
                      Good morning.
                    </p>

                    <div className="mt-[18px] flex h-[52px] items-center gap-2.5 rounded-[14px] border border-line bg-[#f7f7f9] pl-[18px] pr-2">
                      <span className="flex-1 truncate text-[15px] font-medium tracking-[-0.24px] text-mute-2">
                        Ask about an applicant…
                      </span>
                      <span
                        aria-hidden
                        className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-btn bg-blue text-white"
                      >
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>

                    <p className="mt-7 text-[12px] font-medium text-mute-2">Upcoming reviews</p>
                    <ol className="mt-2.5 space-y-2">
                      {REVIEWS.map((row) => (
                        <li key={row.name} className="grid grid-cols-[92px_minmax(0,1fr)] gap-3">
                          <span className="num pt-3.5 text-[12px] font-medium text-mute-2">
                            {row.time}
                          </span>
                          <article
                            className={`rounded-lg border border-line bg-paper px-3.5 py-2.5 ${
                              row.open ? "shadow-[0_1px_2px_rgba(17,17,20,0.04)]" : ""
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <span
                                aria-hidden
                                className={`flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full text-[9.5px] font-bold tracking-[-0.02em] ${row.ava}`}
                              >
                                {row.initials}
                              </span>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-[13.5px] font-semibold tracking-[-0.27px] text-ink">
                                  {row.name}
                                </p>
                                <p className="mt-0.5 truncate text-[12px] font-medium text-mute">
                                  {row.meta}
                                </p>
                              </div>
                              <span
                                className={`inline-flex h-[22px] shrink-0 items-center rounded-full px-2 text-[12px] font-medium ${
                                  row.statusTone || "bg-[#f3f3f5] text-ink-2"
                                }`}
                              >
                                {row.status}
                              </span>
                            </div>
                            {row.open && row.bits.length > 0 && (
                              <div className="mt-2.5 ml-9 flex flex-wrap gap-x-3.5 gap-y-2 border-t border-line pt-2.5 text-[12px] font-medium text-mute">
                                {row.bits.map((bit) => (
                                  <span key={bit}>{bit}</span>
                                ))}
                              </div>
                            )}
                          </article>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Hairline cell band */}
        <section aria-label="Listings and packet slices" className="border-y border-line bg-mist">
          <div className="mx-auto max-w-shell px-5 sm:px-8">
            <ul className="grid grid-cols-3 sm:grid-cols-5">
              {LOGO_CELLS.map((cell, index) => (
                <li
                  key={cell}
                  className={`flex h-[76px] items-center justify-center border-line text-[13px] font-medium tracking-[-0.2px] text-mute ${
                    index % 3 !== 2 ? "border-r" : ""
                  } sm:border-r sm:[&:nth-child(5n)]:border-r-0 ${
                    index < LOGO_CELLS.length - 3 ? "border-b" : ""
                  }`}
                >
                  {cell}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Platform */}
        <section id="platform" className="bg-mist py-16 sm:py-28" aria-labelledby="platform-title">
          <div className="mx-auto max-w-shell px-5 sm:px-8">
            <p className="mb-[18px] inline-flex h-6 items-center rounded-full bg-blue-soft px-2.5 text-[13px] font-medium tracking-[-0.16px] text-blue">
              Platform
            </p>
            <Headline
              id="platform-title"
              lead="The desk that never loses a file."
              tone="Applicants pay. The packet lands scored. You approve or decline."
              className="max-w-[28ch]"
            />

            <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">
              {PLATFORM_CARDS.map((card) => (
                <article key={card.kicker} className="rounded-lg border border-line bg-paper p-6">
                  <p className="text-[12px] font-medium uppercase tracking-[0.06em] text-mute-2">
                    {card.kicker}
                  </p>
                  <h3 className="mt-3 text-[24px] font-medium leading-[27.6px] tracking-[-0.24px] text-ink">
                    {card.lead} <span className="tone">{card.tone}</span>
                  </h3>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="border-t border-line bg-mist py-16 sm:py-24" aria-labelledby="how-title">
          <div className="mx-auto max-w-shell px-5 sm:px-8">
            <Headline
              id="how-title"
              lead="Four steps, start to decision."
              tone="Most applications complete in about ten minutes."
              className="max-w-3xl"
            />

            <ol className="mt-10 grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
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

        {/* Packet slices */}
        <section id="packet" className="border-t border-line bg-mist py-16 sm:py-24" aria-labelledby="packet-title">
          <div className="mx-auto max-w-shell px-5 sm:px-8">
            <p className="mb-3.5 text-[13px] font-medium tracking-[-0.13px] text-mute">The file</p>
            <Headline
              id="packet-title"
              lead="Everything in the packet."
              tone="Four slices of the same sealed file. Read them on the desk, not across tabs."
              className="max-w-[22ch]"
            />

            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {SLICES.map((slice) => (
                <article key={slice.kicker} className="rounded-lg border border-line bg-paper p-5">
                  <p className="text-[12px] font-medium uppercase tracking-[0.06em] text-mute-2">
                    {slice.kicker}
                  </p>
                  <p className="mt-2 text-[15px] font-medium leading-[21px] tracking-[-0.16px] text-ink">
                    {slice.lead}
                  </p>
                  <dl className="mt-4 border-t border-line pt-3">
                    {slice.rows.map(([label, value]) => (
                      <div key={label} className="flex justify-between gap-3 py-1.5">
                        <dt className="text-[13px] font-medium text-mute">{label}</dt>
                        <dd className="num text-[13px] font-medium text-ink">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Fees — ported from design/attio-inspired #rates */}
        <section
          id="rates"
          className="py-16 sm:py-28"
          aria-labelledby="rates-title"
        >
          <div className="mx-auto max-w-shell px-5 sm:px-8">
            <p className="mb-3.5 text-[13px] font-medium tracking-[-0.13px] text-mute">Fees</p>
            <Headline
              id="rates-title"
              lead="Applicants pay the fee."
              tone="Landlords do not pay to use the desk. The renter covers screening when they apply."
              className="max-w-[22ch]"
            />

            <div className="mt-14 grid grid-cols-1 border-t border-line sm:grid-cols-2">
              <article className="pt-7">
                <p className="mb-2 text-[14px] font-medium text-mute">Standard</p>
                <p className="num mb-3 text-[40px] font-medium leading-[44px] tracking-[-0.4px] text-ink">
                  $39.99
                </p>
                <p className="max-w-[32ch] text-[15px] font-medium leading-[1.5] text-mute">
                  Credit, criminal, and eviction, sealed into the packet with a LeaseScore.
                </p>
              </article>
              <article className="border-t border-line pt-7 sm:ml-12 sm:border-l sm:border-t-0 sm:pl-12">
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

        {/* Renter strip */}
        <section id="apply" className="border-t border-line py-14" aria-labelledby="apply-title">
          <div className="mx-auto flex max-w-shell flex-col gap-5 px-5 sm:px-8 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[13px] font-medium tracking-[-0.13px] text-mute">
                For renters
              </p>
              <h2
                id="apply-title"
                className="mt-2 text-[24px] font-medium leading-[27.6px] tracking-[-0.24px] text-ink"
              >
                Apply for {property.address.split(",")[0]}
              </h2>
              <p className="mt-1.5 text-[14px] font-medium text-mute">
                {property.bedrooms} bedroom ·{" "}
                <span className="num">${property.rent.toLocaleString()}</span> per month · you pay
                the screening fee.
              </p>
            </div>
            <Button asChild size="cta" className="shrink-0">
              <Link href={APPLY_HREF}>Begin ($39.99 / $59.99)</Link>
            </Button>
          </div>
        </section>

        {/* Dark close */}
        <section className="bg-dark py-20 sm:py-28" aria-labelledby="close-title">
          <div className="mx-auto max-w-shell px-5 text-center sm:px-8">
            <h2
              id="close-title"
              className="mx-auto max-w-2xl text-[32px] font-medium leading-[1.05] tracking-[-0.9px] text-white sm:text-[48px]"
            >
              Screening runs on LeaseFlow.
            </h2>
            <div className="mt-8 flex flex-wrap justify-center gap-2.5">
              <Button asChild variant="dark" size="cta">
                <Link href={APPLY_HREF}>Apply as renter</Link>
              </Button>
              <Button asChild variant="darkFill" size="cta">
                <Link href={APPLY_HREF}>Start for free</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer id="legal" className="bg-dark pb-10 pt-14 text-on-dark">
        <div className="mx-auto grid max-w-shell gap-10 px-5 sm:px-8 md:grid-cols-[1fr_2fr]">
          <div className="flex items-center gap-2.5 text-white">
            <BrandMark size={20} />
            <BrandWord />
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {[
              { head: "Product", links: ["Applications", "Packet", "Pricing", "Desk"] },
              { head: "Resources", links: ["Apply", "What's in a file", "FCRA"] },
              { head: "Legal", links: ["Privacy", "Terms", "Consumer reports"] },
            ].map((column) => (
              <div key={column.head}>
                <p className="text-[13px] font-semibold tracking-[-0.13px] text-white">
                  {column.head}
                </p>
                <ul className="mt-3 space-y-2">
                  {column.links.map((label) => (
                    <li key={label}>
                      <Link
                        href="#legal"
                        className="text-[13px] font-medium text-[#9aa3af] transition-colors duration-160 ease-premium hover:text-white"
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <p className="mx-auto mt-12 max-w-shell border-t border-[#232323] px-5 pt-6 text-[12px] font-medium leading-5 text-[#8d99a8] sm:px-8">
          Screening reports are consumer reports under the FCRA. This site is a prototype — names,
          scores, and tradelines are mock data, and no consumer reporting agency is used.
        </p>
      </footer>
    </div>
  );
}
