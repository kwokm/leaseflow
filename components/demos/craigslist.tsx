'use client';

import { DemoPlay } from "@/components/demos/shell";

const POSTS = [
  { delay: "0.15s", title: "170 Chorus", note: "4BR · $6,500/mo · Irvine" },
  { delay: "1.25s", title: "Rise Park house", note: "Posted automatically · Demo sync" },
  { delay: "2.35s", title: "Chorus follow-up", note: "Lead captured · AI reply queued" },
] as const;

export function CraigslistDemo() {
  return (
    <DemoPlay>
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-[13px] font-semibold text-ink">Craigslist — auto posting</p>
        <span className="relative desk-pill is-on">
          <span className="d d-glow pointer-events-none absolute inset-0 rounded-[inherit] border border-[#c4b8dc]" />
          Live
        </span>
      </div>
      <ul className="space-y-2">
        {POSTS.map((post) => (
          <li
            key={post.title}
            className="d d-cl rounded-md border border-line px-3 py-2.5"
            style={{ animationDelay: post.delay }}
          >
            <p className="text-[13px] font-semibold text-ink">{post.title}</p>
            <p className="mt-0.5 text-[12px] font-medium text-mute">{post.note}</p>
          </li>
        ))}
      </ul>
    </DemoPlay>
  );
}
