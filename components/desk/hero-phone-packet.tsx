import { ChevronLeft } from "lucide-react";
import { BrandMark, BrandWord } from "@/components/brand";

const TICKS = [
  { label: "Photo ID", state: "on" as const },
  { label: "Experian", state: "on" as const },
  { label: "AI Income Check", state: "on" as const },
  { label: "Background", state: "on" as const },
];

function SignalBars() {
  return (
    <svg width="15" height="10" viewBox="0 0 15 10" aria-hidden>
      <rect x="0" y="6.5" width="2.4" height="3.5" rx="0.6" fill="currentColor" />
      <rect x="4" y="4.5" width="2.4" height="5.5" rx="0.6" fill="currentColor" />
      <rect x="8" y="2.2" width="2.4" height="7.8" rx="0.6" fill="currentColor" />
      <rect x="12" y="0" width="2.4" height="10" rx="0.6" fill="currentColor" />
    </svg>
  );
}

function WifiMark() {
  return (
    <svg width="14" height="10" viewBox="0 0 14 10" aria-hidden>
      <path
        d="M1.2 3.4c3.3-2.8 8.3-2.8 11.6 0"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M3.4 5.6c2.1-1.8 5.1-1.8 7.2 0"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <circle cx="7" cy="8.4" r="1.15" fill="currentColor" />
    </svg>
  );
}

function BatteryMark() {
  return (
    <svg width="22" height="10" viewBox="0 0 22 10" aria-hidden>
      <rect
        x="0.6"
        y="0.6"
        width="18.2"
        height="8.8"
        rx="2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <rect x="2.1" y="2.1" width="13.4" height="5.8" rx="1" fill="currentColor" />
      <rect x="19.6" y="3.1" width="1.6" height="3.8" rx="0.6" fill="currentColor" />
    </svg>
  );
}

/**
 * Native-app crop of Jane Doe’s SAMPLE packet for the landing hero.
 * Dedicated phone chrome — not a desktop window stuffed in a bezel.
 */
export function HeroPhonePacket() {
  return (
    <div className="hero-device" aria-label="Leaseproof app, Jane Doe sample packet">
      <div className="hero-device-frame">
        <div className="hero-device-screen">
          <div className="hero-device-status">
            <span className="hero-device-time">9:41</span>
            <span className="hero-device-island" aria-hidden />
            <span className="hero-device-sigs">
              <SignalBars />
              <WifiMark />
              <BatteryMark />
            </span>
          </div>

          <header className="hero-device-nav">
            <span className="hero-device-back" aria-hidden>
              <ChevronLeft width={20} height={20} strokeWidth={2.2} />
            </span>
            <span className="hero-device-brand">
              <BrandMark size={16} />
              <BrandWord className="text-[13px] font-semibold tracking-[-0.4px]" />
            </span>
            <span className="sample-stamp">SAMPLE</span>
          </header>

          <div className="hero-device-body">
            <p className="text-[16px] font-medium leading-[22px] tracking-[-0.16px] text-ink">
              Jane Doe · 170 Chorus
            </p>
            <p className="mt-0.5 text-[13px] font-medium text-mute">
              Standard · applicants pay $24.99
            </p>

            <div className="hero-device-glance">
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-mute">Experian score</p>
                <p className="num mt-1 text-[32px] font-semibold leading-none tracking-[-0.6px] text-ink">
                  724
                </p>
                <p className="mt-1 text-[13px] font-medium text-mute">Sample</p>
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-mute">Monthly gross from AI Income Check</p>
                <p className="num mt-1 text-[32px] font-semibold leading-none tracking-[-0.6px] text-ink">
                  $8,500
                </p>
                <p className="mt-1.5 flex flex-wrap gap-1">
                  <span className="status status-ok">Match</span>
                  <span className="status status-ok">Current</span>
                </p>
              </div>
            </div>

            <ul className="hero-device-ticks">
              {TICKS.map((tick) => (
                <li key={tick.label}>
                  <span className="pillar-tick" aria-hidden>
                    ✓
                  </span>
                  <span>{tick.label}</span>
                </li>
              ))}
            </ul>
          </div>

          <span className="hero-device-home" aria-hidden />
        </div>
      </div>
    </div>
  );
}
