"use client";

import Image from "next/image";
import { DemoPlay } from "@/components/demos/shell";
import { ANAHEIM_PHOTOS } from "@/lib/data/mock-data";
import { cn } from "@/lib/utils";

const BOARDS = [
  { name: "Zillow", mark: "Z", color: "#006aff", float: "0s", live: "0.8s" },
  { name: "Apts", mark: "A", color: "#00a86b", float: "0.35s", live: "1.1s" },
  { name: "HotPads", mark: "H", color: "#7b2cbf", float: "0.7s", live: "1.4s" },
  { name: "Facebook", mark: "f", color: "#1877f2", float: "1s", live: "1.7s" },
  { name: "CL", mark: "CL", color: "#5a2d82", float: "1.25s", live: "2s" },
] as const;

export function LySyndication() {
  return (
    <DemoPlay flush className="ly ly-card ly-dark ly-pad">
      <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[color:var(--ly-mute)]">
        One listing
      </p>
      <div className="d d-breathe mt-3 rounded-2xl bg-white px-4 py-3 text-[color:var(--ly-ink)]">
        <p className="text-[15px] font-semibold">510 S Resh St</p>
        <p className="mt-0.5 text-[12px] font-medium text-[#6b7280]">
          Anaheim · 3 bed · $4,700/mo · synced instantly
        </p>
      </div>
      <ul className="mt-5 flex flex-wrap justify-center gap-3">
        {BOARDS.map((board) => (
          <li key={board.name} className="flex flex-col items-center gap-1.5">
            <div
              className="d d-float ly-logo"
              style={{ background: board.color, animationDelay: board.float }}
            >
              {board.mark}
            </div>
            <span className="d d-live ly-live" style={{ animationDelay: board.live }}>
              <span className="ly-dot" /> Live
            </span>
          </li>
        ))}
      </ul>
    </DemoPlay>
  );
}

function LeadBeat({
  delay,
  time,
  text,
  tone,
  side,
}: {
  delay: string;
  time: string;
  text: string;
  tone: "late" | "lost" | "win";
  side: "without" | "with";
}) {
  return (
    <div className={cn("d d-thread ly-lead-beat", `is-${side}`)} style={{ animationDelay: delay }}>
      <p className="ly-lead-time">{time}</p>
      <div className={cn("ly-lead-bubble", `is-${tone}`)}>{text}</div>
    </div>
  );
}

export function LyLead() {
  return (
    <DemoPlay flush className="ly ly-card ly-proof ly-pad">
      <div className="ly-lead-head">
        <span>Maria S. submits inquiry on</span>
        <span className="ly-lead-channel">Zillow</span>
      </div>

      <div className="ly-lead-grid">
        <p className="ly-lead-label is-without">Without</p>
        <span className="ly-lead-gutter" />
        <p className="ly-lead-label is-with">With agent</p>

        <LeadBeat
          delay="0s"
          time="Sun 9:14am"
          tone="late"
          side="without"
          text="You reply — 9.5 hours later."
        />
        <span className="ly-lead-node" />
        <LeadBeat
          delay="1.25s"
          time="Sat 11:47pm"
          tone="win"
          side="with"
          text="AI replies in 18 seconds."
        />

        <LeadBeat
          delay="2.35s"
          time="Sun 9:21am"
          tone="lost"
          side="without"
          text={'Maria: “Already rented elsewhere.”'}
        />
        <span className="ly-lead-node" />
        <LeadBeat
          delay="4.05s"
          time="Sat 11:52pm"
          tone="win"
          side="with"
          text="Maria books Tuesday 10:30 at 510 S Resh."
        />
      </div>
    </DemoPlay>
  );
}

const SLOTS = [
  { time: "9:00am", place: "Broadway", status: "no-show", pill: "ly-pill-red" },
  { time: "10:30am", place: "Resh St", status: "confirmed", pill: "ly-live", confirmed: true },
  { time: "12:00pm", place: "Anaheim Blvd", status: "confirmed", pill: "ly-live", confirmed: true },
  { time: "2:00pm", place: "Resh St", status: "available", pill: "ly-pill-mint", live: true },
] as const;

export function LyShowings() {
  return (
    <DemoPlay flush className="ly ly-card ly-light ly-pad">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6b7280]">
            Self-booking system
          </p>
          <p className="mt-1 text-[16px] font-semibold">Tuesday Showing Schedule</p>
        </div>
        <span className="relative ly-live">
          <span className="d d-glow pointer-events-none absolute inset-0 rounded-[inherit] border border-[color:var(--ly-green)]" />
          Live availability
        </span>
      </div>
      <ul className="space-y-2">
        {SLOTS.map((slot, index) => (
          <li
            key={slot.time}
            className="d d-enter relative overflow-hidden rounded-xl bg-[#f4f5f7] px-3 py-2.5"
            style={{ animationDelay: `${index * 160}ms` }}
          >
            <div
              className={cn(
                "flex items-center justify-between gap-3",
                slot.confirmed && "d d-nudge",
              )}
            >
              <p className="text-[13px] font-semibold">
                {slot.time} <span className="font-medium text-[#6b7280]">· {slot.place}</span>
              </p>
              <span className={slot.pill}>{slot.status}</span>
            </div>
            {slot.confirmed ? (
              <span className="d d-flash pointer-events-none absolute inset-0 rounded-[inherit] border border-[color:var(--ly-green)]" />
            ) : null}
          </li>
        ))}
      </ul>
    </DemoPlay>
  );
}

const CHECKS = [
  { label: "Photo ID", note: "Name matches the applicant", retick: "1s" },
  { label: "Experian", note: "Demo pull · landlord not charged", retick: "1.5s" },
  { label: "AI income check", note: "Name match · last two months", retick: "2s" },
  { label: "Background", note: "Mock public-records note", retick: "2.5s" },
] as const;

export function LyScreening() {
  return (
    <DemoPlay flush className="ly ly-card ly-light ly-pad">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6b7280]">
            Applicant verification
          </p>
          <p className="mt-1 text-[16px] font-semibold">Screening Checklist</p>
        </div>
        <span className="ly-live">Auto-verified</span>
      </div>
      <ul className="space-y-2">
        {CHECKS.map((row, index) => (
          <li
            key={row.label}
            className="d d-enter flex items-center justify-between gap-3 rounded-xl bg-[#f4f5f7] px-3 py-2.5"
            style={{ animationDelay: `${index * 160}ms` }}
          >
            <div>
              <p className="text-[13px] font-semibold">{row.label}</p>
              <p className="mt-0.5 text-[12px] font-medium text-[#6b7280]">{row.note}</p>
            </div>
            <span className="d d-retick" style={{ animationDelay: row.retick }}>
              <span
                className="d d-check ly-check"
                style={{ animationDelay: `${index * 160 + 120}ms` }}
              >
                ✓
              </span>
            </span>
          </li>
        ))}
      </ul>
    </DemoPlay>
  );
}

const LEASE_STEPS = [
  { label: "Application approved", note: "Today, 2:14pm", state: "Done", icon: "✓" },
  { label: "Lease generated & sent", note: "Today, 2:15pm — auto", state: "Done", icon: "▦" },
  { label: "E-signature pending", note: "Reminder in 2 hours", state: "Awaiting", icon: "✍", active: true },
  { label: "Deposit collection (ACH)", note: "Scheduled for after signing", state: "Queued", icon: "$" },
] as const;

export function LyLease() {
  return (
    <DemoPlay flush className="ly ly-card ly-light ly-pad">
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6b7280]">
        Jane Doe · 510 S Resh St
      </p>
      <ol className="mt-4 space-y-2">
        {LEASE_STEPS.map((step, index) => (
          <li
            key={step.label}
            className="d d-enter-lease relative overflow-hidden rounded-xl bg-[#f4f5f7] px-3 py-2.5"
            style={{ animationDelay: `${index * 140}ms` }}
          >
            {step.active ? (
              <span className="d d-glow-lease pointer-events-none absolute inset-0 rounded-[inherit] border border-[color:var(--ly-orange)]" />
            ) : null}
            <div className="relative flex items-center gap-3">
              <span
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold",
                  step.active
                    ? "bg-[color:var(--ly-orange-soft)] text-[color:var(--ly-orange)]"
                    : index < 2
                      ? "bg-[color:var(--ly-green-soft)] text-[color:var(--ly-green)]"
                      : "bg-[#e5e7eb] text-[#6b7280]",
                )}
              >
                {step.icon}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold">{step.label}</p>
                <p className="mt-0.5 text-[12px] font-medium text-[#6b7280]">{step.note}</p>
              </div>
              <span
                className={
                  step.active ? "ly-pill-orange" : index < 2 ? "ly-live" : "ly-pill-gray"
                }
              >
                {step.state}
              </span>
            </div>
          </li>
        ))}
      </ol>
    </DemoPlay>
  );
}

const PHONE_LINES = [
  { delay: "0s", from: "caller" as const, body: "Hi, I saw your listing on Zillow — is 510 S Resh St still available?" },
  { delay: "1.35s", from: "agent" as const, body: "Yes. 3-bed, 2-bath, $4,700/mo, September 1. Want to book a showing?" },
  { delay: "2.7s", from: "caller" as const, body: "Tuesday at 2pm works." },
  { delay: "4.05s", from: "agent" as const, body: "Booked Tuesday at 2:00 at 510 S Resh St. Confirmation text incoming." },
];

export function LyPhone() {
  return (
    <DemoPlay flush className="ly ly-card ly-proof ly-pad">
      <div className="ly-proof-card px-3 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="d d-dot-call ly-dot" />
            <p className="text-[14px] font-semibold tracking-[-0.2px] text-ink">
              AI Agent — live call
            </p>
          </div>
          <span className="text-[12px] font-medium text-mute">0:47</span>
        </div>
        <div className="ly-eq mx-auto mt-3">
          {[0, 0.1, 0.2, 0.3, 0.4].map((delay) => (
            <span key={delay} className="d d-eq" style={{ animationDelay: `${delay}s` }} />
          ))}
        </div>
        <div className="mt-4 space-y-3">
          {PHONE_LINES.map((line) => (
            <div
              key={line.body}
              className={cn("d d-thread", line.from === "agent" ? "ml-8" : "mr-8")}
              style={{ animationDelay: line.delay }}
            >
              <p
                className={cn(
                  "mb-1 text-[10px] font-semibold uppercase tracking-[0.08em]",
                  line.from === "agent" ? "text-right text-[color:var(--ly-accent)]" : "text-mute-2",
                )}
              >
                {line.from === "agent" ? "Agent" : "Caller"}
              </p>
              <div className={line.from === "agent" ? "ly-proof-out" : "ly-proof-in"}>{line.body}</div>
            </div>
          ))}
        </div>
      </div>
    </DemoPlay>
  );
}

const FB_LINES = [
  { delay: "0.15s", from: "lead" as const, body: "Is 510 S Resh still available? What’s the move-in?", at: "11:52 PM" },
  { delay: "1.25s", from: "agent" as const, body: "Yes! Anaheim, September 1, $4,700/mo. Tuesday or Thursday?", at: "11:52 PM" },
  { delay: "2.35s", from: "lead" as const, body: "Tuesday 10:30. See you on Resh St.", at: "11:54 PM" },
];

export function LyFacebook() {
  return (
    <DemoPlay flush className="ly ly-card ly-light ly-pad">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6b7280]">
            Marketplace
          </p>
          <p className="mt-1 text-[16px] font-semibold">Facebook</p>
        </div>
        <span className="flex items-center gap-1.5 text-[12px] font-semibold text-[#1a8f5a]">
          <span className="d d-dot-fb ly-dot" />
          Active now
        </span>
      </div>
      <div className="space-y-2">
        {FB_LINES.map((line) => (
          <div key={line.body}>
            <div
              className={cn("d d-fb", line.from === "agent" ? "ly-fb-out" : "ly-fb-in")}
              style={{ animationDelay: line.delay }}
            >
              {line.from === "lead" ? <span className="mr-1 font-semibold">Maria</span> : null}
              {line.body}
            </div>
            <p
              className={cn(
                "mt-1 text-[10px] font-medium text-[#8b909a]",
                line.from === "agent" && "text-right",
              )}
            >
              {line.at}
            </p>
          </div>
        ))}
      </div>
    </DemoPlay>
  );
}

const CL_POSTS = [
  { delay: "0.15s", title: "510 S Resh St", note: "Posted automatically · $4,700/mo" },
  { delay: "1.25s", title: "The Colony house", note: "Lead captured instantly" },
  { delay: "2.35s", title: "Resh St follow-up", note: "AI follow-up sent" },
] as const;

export function LyCraigslist() {
  return (
    <DemoPlay flush className="ly ly-card ly-dark ly-pad">
      <div className="mb-4 flex items-center justify-between gap-2">
        <p className="text-[15px] font-semibold">Craigslist — auto posting</p>
        <span className="relative ly-live">
          <span className="d d-glow pointer-events-none absolute inset-0 rounded-[inherit] border border-[color:var(--ly-green)]" />
          live
        </span>
      </div>
      <ul className="space-y-2">
        {CL_POSTS.map((post) => (
          <li
            key={post.title}
            className="d d-cl rounded-xl bg-[color:var(--ly-bg-2)] px-3 py-2.5"
            style={{ animationDelay: post.delay }}
          >
            <p className="text-[13px] font-semibold">{post.title}</p>
            <p className="mt-0.5 text-[12px] font-medium text-[color:var(--ly-mute)]">{post.note}</p>
          </li>
        ))}
      </ul>
    </DemoPlay>
  );
}

const STOPS = [
  { delay: "0.4s", label: "510 S Resh St", note: "First stop", price: "$4,700", fit: "Market fit", tone: "ly-live" },
  { delay: "1.6s", label: "318 W Broadway", note: "9:00", price: "$2,100", fit: "Under market", tone: "ly-pill-mint" },
  { delay: "2.8s", label: "201 S Anaheim Blvd", note: "12:00", price: "$2,300", fit: "Competitive", tone: "ly-pill-amber" },
  { delay: "4.0s", label: "The Colony", note: "Nearby", price: "$2,650", fit: "Overpriced", tone: "ly-pill-red" },
] as const;

export function LyRoute() {
  return (
    <DemoPlay flush className="ly ly-card ly-dark ly-pad">
      <p className="text-[15px] font-semibold">Smart route planner</p>
      <p className="mt-1 text-[12px] font-medium text-[color:var(--ly-mute)]">Tuesday · Anaheim</p>
      <div className="ly-map mt-4 px-2 py-3">
        <svg className="h-16 w-full" viewBox="0 0 320 64" fill="none" aria-hidden>
          <path
            className="d d-route"
            d="M16 48 C 70 48, 90 16, 140 16 S 200 48, 248 28 S 290 20, 304 20"
            stroke="#ff6a2b"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeDasharray="1000"
            strokeDashoffset="1000"
          />
          {[
            [16, 48],
            [140, 16],
            [248, 28],
            [304, 20],
          ].map(([x, y]) => (
            <circle key={x} cx={x} cy={y} r="4" fill="#ff6a2b" />
          ))}
        </svg>
      </div>
      <ul className="mt-3 grid grid-cols-2 gap-2">
        {STOPS.map((stop) => (
          <li
            key={stop.label}
            className="d d-stop rounded-xl bg-[color:var(--ly-bg-2)] px-3 py-2"
            style={{ animationDelay: stop.delay }}
          >
            <p className="text-[12px] font-semibold">{stop.label}</p>
            <p className="mt-0.5 text-[11px] text-[color:var(--ly-mute)]">
              {stop.note} · {stop.price}
            </p>
            <span className={cn("mt-1.5", stop.tone)}>{stop.fit}</span>
          </li>
        ))}
      </ul>
    </DemoPlay>
  );
}

const STATUSES = [
  { cls: "d-status-a", label: "Scanning room", last: false },
  { cls: "d-status-b", label: "Detecting layout", last: false },
  { cls: "d-status-c", label: "Adding furniture", last: false },
  { cls: "d-status-d", label: "Generating staged photo", last: true },
] as const;

export function LyPhoto() {
  return (
    <DemoPlay flush className="ly ly-card ly-dark ly-pad">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-[12px] font-semibold text-[color:var(--ly-mute)]">Original</p>
        <p className="text-[12px] font-semibold text-[color:var(--ly-orange)]">Enhanced</p>
      </div>
      <div className="relative mb-2 h-5">
        {STATUSES.map((row) => (
          <p
            key={row.label}
            className={`d d-status ${row.cls}${row.last ? " d-status-last" : ""} absolute inset-0 text-[12px] font-medium text-[color:var(--ly-mute)]`}
          >
            {row.label}
          </p>
        ))}
      </div>
      <div className="relative aspect-[16/9] overflow-hidden rounded-xl bg-[color:var(--ly-bg-2)]">
        <Image
          src={ANAHEIM_PHOTOS[2]}
          alt="510 S Resh St living room"
          fill
          sizes="(min-width: 768px) 520px, 100vw"
          className="object-cover"
        />
        <div className="absolute inset-0">
          <Image
            src={ANAHEIM_PHOTOS[2]}
            alt=""
            fill
            sizes="(min-width: 768px) 520px, 100vw"
            className="d d-enhance photo-enhance object-cover"
          />
        </div>
        <span className="d d-scan pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-transparent via-white/45 to-transparent" />
      </div>
    </DemoPlay>
  );
}
