import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { PageWash } from "@/components/page-wash";

export function MarketingPage({
  kicker,
  title,
  children,
}: {
  kicker: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-white">
      <PageWash />
      <SiteHeader />
      <main id="main" className="relative z-10 flex-1">
        <div className="mx-auto max-w-[760px] px-5 py-12 sm:px-8 sm:py-16">
          <p className="text-[13px] font-medium tracking-[-0.13px] text-mute">{kicker}</p>
          <h1 className="mt-2 text-[30px] font-medium leading-[1.12] tracking-[-0.6px] text-ink sm:text-[36px]">
            {title}
          </h1>
          <div className="mt-8 space-y-10">{children}</div>
        </div>
      </main>
      <div className="relative z-10">
        <SiteFooter />
      </div>
    </div>
  );
}

export function MarketingSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-[16px] font-medium leading-[22px] tracking-[-0.16px] text-ink">
        {title}
      </h2>
      <div className="mt-2 space-y-3 text-[16px] font-medium leading-[22px] text-mute">
        {children}
      </div>
    </section>
  );
}
