import Image from "next/image";
import { PacketWindow } from "@/components/desk/packet-window";
import { FEATURED_PHOTOS } from "@/lib/data/mock-data";

const GLANCE_TICKS = [
  { label: "Photo ID", state: "on" as const, note: "Sample" },
  { label: "Experian", state: "on" as const, note: "Sample" },
  { label: "AI Income Check", state: "on" as const, note: "Sample" },
  { label: "Background", state: "off" as const, note: "Sample" },
];

/**
 * One Jane Doe packet for the landing — a landlord glance, not a looping demo.
 * Income is framed as read from upload. Background stays off (no vendor).
 */
export function HeroPacket() {
  return (
    <div className="hero-packet">
      <PacketWindow title="Application packet · Jane Doe" meta="Screening · Standard" stamp="SAMPLE">
        <div className="px-4 py-4 sm:px-5 sm:py-5">
          <div className="relative h-20 overflow-hidden rounded-md border border-line bg-mist sm:h-24">
            <Image
              src={FEATURED_PHOTOS[0]}
              alt=""
              fill
              sizes="520px"
              className="object-cover"
            />
          </div>

          <div className="mt-3 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[16px] font-medium leading-[22px] tracking-[-0.16px] text-ink">
                Jane Doe · 170 Chorus
              </p>
              <p className="mt-0.5 text-[13px] font-medium text-mute">
                Standard · applicants pay $24.99
              </p>
            </div>
            <span className="pillar-pill">Included · $0 landlord extra</span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 rounded-md bg-wash px-3 py-3">
            <div className="min-w-0">
              <p className="text-[13px] font-medium text-mute">Experian score</p>
              <p className="num mt-1 text-[36px] font-semibold leading-none tracking-[-0.6px] text-ink">
                724
              </p>
              <p className="mt-1 text-[13px] font-medium text-mute">Sample</p>
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-medium text-mute">Monthly gross from AI Income Check</p>
              <p className="num mt-1 text-[36px] font-semibold leading-none tracking-[-0.6px] text-ink">
                $8,500
              </p>
              <p className="mt-1 text-[13px] font-medium text-mute">Read from upload · Sample</p>
            </div>
          </div>

          <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {GLANCE_TICKS.map((tick) => (
              <li key={tick.label} className="min-w-0 rounded-md bg-mist px-2 py-2">
                <p className="flex items-center justify-between gap-1 text-[13px] font-medium text-ink">
                  <span className="truncate">{tick.label}</span>
                  {tick.state === "on" ? (
                    <span className="pillar-tick" aria-hidden>
                      ✓
                    </span>
                  ) : (
                    <span className="text-[13px] font-medium text-mute-2" aria-hidden>
                      ·
                    </span>
                  )}
                </p>
                <p className="mt-0.5 text-[13px] font-medium text-mute">{tick.note}</p>
              </li>
            ))}
          </ul>
        </div>
      </PacketWindow>
    </div>
  );
}
