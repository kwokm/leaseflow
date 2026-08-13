import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPropertyById } from "@/lib/data/mock-data";

// Every renter-facing CTA points at the demo listing's application.
const DEMO_LISTING_ID = "prop-1";
const APPLY_HREF = `/apply/${DEMO_LISTING_ID}`;

function BrandMark({ size = 22 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden className="shrink-0">
      <rect width="24" height="24" rx="6.5" fill="currentColor" />
      <rect
        x="6.2"
        y="5.2"
        width="11.6"
        height="13.6"
        rx="2"
        fill="none"
        stroke="#fff"
        strokeWidth="1.55"
      />
      <path d="M6.2 9.4h11.6" stroke="#fff" strokeWidth="1.55" />
    </svg>
  );
}

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

const DESK_ROWS = [
  { time: "9:12 AM", name: "Sarah Johnson", meta: "742 Evergreen Terrace · Premium", score: "785" },
  { time: "8:40 AM", name: "Jessica Martinez", meta: "742 Evergreen Terrace · Premium", score: "695" },
  { time: "Yesterday", name: "Emily Rodriguez", meta: "123 Main Street 4B · Standard", score: "820" },
];

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

const PACKAGES = [
  {
    name: "Standard",
    price: "$39.99",
    blurb: "Everything most landlords ask for.",
    features: [
      "Credit report and score",
      "National criminal search",
      "Eviction records",
      "Identity check",
    ],
  },
  {
    name: "Premium",
    price: "$59.99",
    blurb: "Adds income and employment verification.",
    features: [
      "Everything in Standard",
      "Income verified against pay stubs",
      "Bank statement review",
      "Landlord reference outreach",
    ],
    featured: true,
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
            Applicant-paid packets. Landlords use the desk free.
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
              <span className="text-[16px] font-semibold tracking-[-0.64px]">leaseflow</span>
            </Link>

            <nav aria-label="Primary" className="hidden flex-1 items-center gap-7 md:flex">
              {[
                { href: "#platform", label: "Platform" },
                { href: "#packet", label: "The packet" },
                { href: "#rates", label: "Pricing" },
                { href: APPLY_HREF, label: "For renters" },
              ].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="text-[14px] font-medium tracking-[-0.2px] text-ink-2 hover:text-ink"
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
        <section className="relative overflow-hidden bg-paper pt-16 sm:pt-24" aria-labelledby="hero-title">
          <div className="hero-wash pointer-events-none absolute inset-x-0 bottom-0 h-[62%]" aria-hidden />

          <div className="relative z-10 mx-auto mb-12 max-w-[860px] px-5 text-center sm:px-8">
            <Link
              href="#desk"
              className="mb-5 inline-flex h-[30px] items-center rounded-full border border-line-2 bg-paper px-3 text-[13px] font-medium tracking-[-0.18px] text-ink hover:border-mute-3"
            >
              How landlords review a packet →
            </Link>

            <h1
              id="hero-title"
              className="text-[clamp(40px,5.6vw,80px)] font-semibold leading-[0.95] tracking-[-1.12px] text-ink xl:tracking-[-2.4px]"
            >
              Welcome to the packet.
            </h1>

            <p className="mx-auto mt-5 max-w-[34rem] text-[16px] font-medium leading-[20.8px] tracking-[-0.17px] text-mute">
              LeaseFlow collects the application, the documents, and the credit report, then hands
              you one sealed packet you can approve or decline.
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

          {/* Desk window */}
          <div className="relative z-10 mx-auto max-w-shell px-5 pb-20 sm:px-8" id="desk">
            <div className="overflow-hidden rounded-lg border border-line bg-paper shadow-window">
              <div className="flex h-10 items-center gap-[7px] border-b border-line bg-[#fafafa] px-3.5">
                <span className="h-3 w-3 rounded-full bg-[#E15C6B]" aria-hidden />
                <span className="h-3 w-3 rounded-full bg-[#F5B400]" aria-hidden />
                <span className="h-3 w-3 rounded-full bg-[#12A150]" aria-hidden />
              </div>

              <div className="grid min-h-[420px] grid-cols-1 bg-paper sm:grid-cols-[196px_minmax(0,1fr)]">
                <aside className="hidden flex-col gap-0.5 border-r border-line bg-rail p-2 pt-2.5 sm:flex">
                  <div className="mb-2 flex h-[34px] items-center rounded-md px-2.5 text-[13px] font-semibold tracking-[-0.26px] text-ink">
                    Evergreen desk
                  </div>
                  {["Home", "Applications", "Payments", "Messages", "Properties"].map(
                    (item, index) => (
                      <span
                        key={item}
                        className={`flex h-[34px] items-center rounded-md px-2.5 text-[13px] font-medium ${
                          index === 0 ? "bg-paper text-ink shadow-mini" : "text-mute"
                        }`}
                      >
                        {item}
                      </span>
                    )
                  )}
                </aside>

                <div className="flex min-w-0 flex-col">
                  <div className="flex h-11 items-center justify-between border-b border-line px-5 text-[13px] font-medium text-ink-2">
                    <span>Applications</span>
                    <span className="text-mute-2">6 total · 2 need review</span>
                  </div>

                  <div className="min-w-0 p-6">
                    <p className="text-[28px] font-semibold leading-[1.1] tracking-[-1.1px] text-ink">
                      Good morning.
                    </p>

                    <div className="mt-4 flex h-[52px] items-center gap-2.5 rounded-[14px] border border-line bg-[#f7f7f9] pl-4 pr-2">
                      <span className="flex-1 truncate text-[15px] font-medium tracking-[-0.24px] text-mute-2">
                        Ask about a packet — “who is ready to approve?”
                      </span>
                      <span
                        aria-hidden
                        className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-btn bg-blue text-white"
                      >
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>

                    <p className="mt-6 text-[12px] font-medium text-mute-2">Completed packets</p>
                    <ul className="mt-2.5 space-y-2">
                      {DESK_ROWS.map((row) => (
                        <li key={row.name} className="grid grid-cols-[76px_minmax(0,1fr)] gap-3">
                          <span className="num pt-3.5 text-[12px] font-medium text-mute-2">
                            {row.time}
                          </span>
                          <div className="rounded-lg border border-line bg-paper px-3.5 py-2.5">
                            <div className="flex items-center justify-between gap-3">
                              <div className="min-w-0">
                                <p className="truncate text-[13.5px] font-semibold tracking-[-0.27px] text-ink">
                                  {row.name}
                                </p>
                                <p className="mt-0.5 truncate text-[12px] font-medium text-mute">
                                  {row.meta}
                                </p>
                              </div>
                              <span className="num shrink-0 rounded-md bg-mist px-2 py-1 text-[12px] font-semibold text-ink">
                                {row.score}
                              </span>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Hairline cell band */}
        <section aria-label="Listings and packet slices" className="border-y border-line">
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
        <section id="platform" className="py-16 sm:py-24" aria-labelledby="platform-title">
          <div className="mx-auto max-w-shell px-5 sm:px-8">
            <Headline
              id="platform-title"
              lead="The desk that never loses a file."
              tone="Applicants pay. The packet lands scored. You approve or decline."
              className="max-w-3xl"
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
        <section id="packet" className="py-16 sm:py-24" aria-labelledby="packet-title">
          <div className="mx-auto max-w-shell px-5 sm:px-8">
            <Headline
              id="packet-title"
              lead="Everything in the packet."
              tone="Four slices of the same sealed file, read on the desk instead of across tabs."
              className="max-w-3xl"
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

        {/* Pricing */}
        <section
          id="rates"
          className="border-t border-line bg-mist py-16 sm:py-24"
          aria-labelledby="rates-title"
        >
          <div className="mx-auto max-w-shell px-5 sm:px-8">
            <Headline
              id="rates-title"
              lead="Applicants pay the fee."
              tone="Landlords never pay to use the desk. The renter covers screening when they apply."
              className="max-w-3xl"
            />

            <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">
              {PACKAGES.map((pkg) => (
                <article
                  key={pkg.name}
                  className={`rounded-lg border bg-paper p-6 ${
                    pkg.featured ? "border-ink" : "border-line"
                  }`}
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="text-[24px] font-medium leading-[27.6px] tracking-[-0.24px] text-ink">
                      {pkg.name}
                    </h3>
                    {pkg.featured && (
                      <span className="rounded-md bg-blue-soft px-2 py-0.5 text-[12px] font-medium text-blue">
                        Most chosen
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-[14px] font-medium text-mute">{pkg.blurb}</p>
                  <p className="num mt-5 text-[40px] font-semibold leading-none tracking-[-1.2px] text-ink">
                    {pkg.price}
                  </p>
                  <p className="mt-1.5 text-[13px] font-medium text-mute">
                    One-time, paid by the applicant
                  </p>

                  <ul className="mt-5 space-y-2 border-t border-line pt-5">
                    {pkg.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2 text-[14px] font-medium tracking-[-0.14px] text-ink-2"
                      >
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-ok" aria-hidden />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Button asChild size="cta" variant={pkg.featured ? "default" : "outline"} className="mt-6 w-full">
                    <Link href={APPLY_HREF}>Apply with {pkg.name}</Link>
                  </Button>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Renter strip */}
        <section className="border-t border-line py-14" aria-labelledby="apply-title">
          <div className="mx-auto flex max-w-shell flex-col gap-5 px-5 sm:px-8 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[12px] font-medium uppercase tracking-[0.06em] text-mute-2">
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
            <span className="text-[16px] font-semibold tracking-[-0.64px]">leaseflow</span>
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
                        className="text-[13px] font-medium text-[#9aa3af] hover:text-white"
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
