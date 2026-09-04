import { PacketWindow } from "@/components/desk/packet-window";

const GLANCE_TICKS = [
  { label: "Photo ID", state: "on" as const },
  { label: "Experian", state: "on" as const },
  { label: "AI Income Check", state: "on" as const },
  { label: "Background", state: "on" as const },
];

/**
 * Jane Doe packet for the landing phone mock — a complete landlord glance.
 * Match / Current language only. Background is on for this SAMPLE.
 */
export function HeroPacket() {
  return (
    <div className="hero-packet">
      <PacketWindow title="Jane Doe" meta="Standard" stamp="SAMPLE">
        <div className="hero-packet-body">
          <div className="min-w-0">
            <p className="text-[16px] font-medium leading-[22px] tracking-[-0.16px] text-ink">
              Jane Doe · 170 Chorus
            </p>
            <p className="mt-0.5 text-[13px] font-medium text-mute">
              Standard · applicants pay $24.99
            </p>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2.5 rounded-md bg-wash px-2.5 py-2.5">
            <div className="min-w-0">
              <p className="text-[13px] font-medium text-mute">Experian score</p>
              <p className="num mt-1 text-[28px] font-semibold leading-none tracking-[-0.6px] text-ink">
                724
              </p>
              <p className="mt-1 text-[13px] font-medium text-mute">Sample</p>
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-medium text-mute">Monthly gross from AI Income Check</p>
              <p className="num mt-1 text-[28px] font-semibold leading-none tracking-[-0.6px] text-ink">
                $8,500
              </p>
              <p className="mt-1 flex flex-wrap gap-1">
                <span className="status status-ok">Match</span>
                <span className="status status-ok">Current</span>
              </p>
            </div>
          </div>

          <ul className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5">
            {GLANCE_TICKS.map((tick) => (
              <li key={tick.label} className="flex items-center gap-1.5 text-[13px] font-medium text-ink">
                <span className="pillar-tick" aria-hidden>
                  ✓
                </span>
                <span>{tick.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </PacketWindow>
    </div>
  );
}
