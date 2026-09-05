import { PacketWindow } from "@/components/desk/packet-window";
import { SpatialMount, SpatialOrigin } from "@/components/motion/spatial";
import { PageWash } from "@/components/page-wash";
import { BetaContactLink } from "@/components/legal/beta-contact";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export function LegalPage({
  meta,
  title,
  children,
}: {
  meta: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-white">
      <SpatialOrigin>
        <PageWash />
      </SpatialOrigin>

      <SiteHeader />

      <div className="relative z-10 mx-auto w-full max-w-[720px] flex-1 px-5 py-10 sm:px-8 sm:py-16">
        <SpatialMount>
          <PacketWindow title="Leaseproof" meta={meta}>
            <div className="px-6 py-7 sm:px-8">
              <h1 className="mb-4 text-[24px] font-semibold leading-[1.15] tracking-[-0.4px] text-ink">
                {title}
              </h1>
              <div className="space-y-4 text-[14px] font-medium leading-6 text-mute">{children}</div>
              <p className="mt-6 text-[14px] font-medium leading-5 text-mute">
                Questions: <BetaContactLink className="text-ink underline underline-offset-4" />.
              </p>
            </div>
          </PacketWindow>
        </SpatialMount>
      </div>

      <div className="relative z-10">
        <SiteFooter />
      </div>
    </div>
  );
}
