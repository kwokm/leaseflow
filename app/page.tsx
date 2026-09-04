import Link from "next/link";
import "../components/desk/landing-stage.css";
import { BrandMark, BrandWord } from "@/components/brand";
import { PacketWindow } from "@/components/desk/packet-window";
import { HeroPacket } from "@/components/desk/hero-packet";
import { InView } from "@/components/motion/in-view";
import { SplitWords } from "@/components/motion/split-words";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { ListingPhotoStrip } from "@/components/listings/photos";
import { applyAsRenterHref } from "@/lib/apply/public-cta";
import { LANDLORD_SIGN_IN_HREF, LANDLORD_SIGN_UP_HREF } from "@/lib/auth/roles";
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

export default function Home() {
  const demo = isDemoMode();
  const applyHref = applyAsRenterHref(demo);
  const property = demoPropertyById(FEATURED_LISTING_ID)!;

  return (
    <div className="bg-white">
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

          <div className="ml-auto flex items-center gap-2">
            <Button asChild variant="ghost">
              <Link href={LANDLORD_SIGN_IN_HREF}>Sign in</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={LANDLORD_SIGN_UP_HREF}>Sign up</Link>
            </Button>
          </div>
        </div>
      </header>

      <main id="main">
        <section className="hero" id="top" aria-labelledby="hero-title">
          <div className="hero-wash" aria-hidden />
          <InView className="hero-copy">
            <h1 id="hero-title">
              <span className="block">
                <SplitWords>We screen, verify, and organize</SplitWords>
              </span>
              <span className="block">
                <SplitWords>your lease for you.</SplitWords>
              </span>
            </h1>
            <p className="hero-sub reveal-tone">
              Leaseproof screens applicants, verifies income with AI Income Check,
              and organizes the packet. Credit and background checks are included.
              You decide who to approve.
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
            <HeroPacket />
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
