import Image from "next/image";
import { Home, LayoutGrid, ScrollText } from "lucide-react";
import { PacketWindow } from "@/components/desk/packet-window";
import { Avatar } from "@/components/desk/avatar";
import { mockProperties } from "@/lib/data/mock-data";

const RAIL = [
  { label: "Pipeline", Icon: LayoutGrid, active: true },
  { label: "Applications", Icon: ScrollText, active: false },
  { label: "Properties", Icon: Home, active: false },
] as const;

const TICKS = ["Photo ID", "Experian", "AI Income Check", "Background"] as const;

const HERO_HOMES = [
  { id: "resh-510", label: "170 Chorus" },
  { id: "prop-1", label: "14 Modesto" },
] as const;

const HOMES = HERO_HOMES.flatMap((home) => {
  const property = mockProperties.find((row) => row.id === home.id);
  return property ? [{ property, label: home.label }] : [];
});

/**
 * Compact landlord pipeline crop for the hero. Static cards only — no live
 * desk pipeline, no inner scroll, no clipped household row.
 */
export function HeroPipeline() {
  return (
    <div className="hero-pipe">
      <PacketWindow title="Pipeline · 170 Chorus" meta="Landlord desk" stamp="SAMPLE">
        <div className="hero-pipe-desk">
          <aside className="desk-rail" aria-label="Desk navigation">
            {RAIL.map((item) => (
              <span key={item.label} className={item.active ? "rail-item is-active" : "rail-item"}>
                <item.Icon width={16} height={16} aria-hidden />
                {item.label}
              </span>
            ))}
          </aside>
          <div className="hero-pipe-stage">
            <div className="hero-pipe-grid">
              {HOMES.map(({ property, label }) => {
                const featured = property.id === "resh-510";
                const photo = property.photos?.[0];
                return (
                  <article key={property.id} className="pipe-home">
                    <div className="hero-pipe-photo">
                      {photo ? (
                        <Image
                          src={photo}
                          alt=""
                          fill
                          sizes="220px"
                          className="object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="px-2.5 pt-2 pb-2">
                      <p className="text-[13px] font-medium tracking-[-0.13px] text-ink">
                        {label}
                      </p>
                      <p className="mt-0.5 text-[13px] font-medium text-mute">
                        {property.bedrooms} bed · {property.bathrooms} bath · $
                        {property.rent.toLocaleString()}/mo
                      </p>
                    </div>
                    {featured ? (
                      <div className="hero-pipe-row">
                        <span className="flex min-w-0 items-center gap-2">
                          <Avatar firstName="Jane" lastName="Doe" />
                          <span className="min-w-0">
                            <span className="block truncate text-[13px] font-medium tracking-[-0.13px] text-ink">
                              Jane Doe
                              <span className="ml-1.5 text-[10px] font-medium uppercase tracking-[0.06em] text-mute-2">
                                SAMPLE
                              </span>
                            </span>
                            <span className="mt-1 flex flex-wrap gap-1">
                              <span className="status status-ok">Match</span>
                              <span className="status status-ok">Current</span>
                            </span>
                          </span>
                        </span>
                        <span className="pipe-tasks">
                          {TICKS.map((label) => (
                            <span key={label} className="pipe-task is-on">
                              <span aria-hidden>✓</span>
                              {label}
                            </span>
                          ))}
                        </span>
                      </div>
                    ) : (
                      <p className="hero-pipe-empty">No applicants yet.</p>
                    )}
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </PacketWindow>
    </div>
  );
}
