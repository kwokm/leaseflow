"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { DeskPill, DeskToolbar } from "@/components/desk/packet-window";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { LEAD_THREADS, channelLabel, type LeadChannel } from "@/lib/leasing/ops";
import { shortAddress } from "@/lib/desk/display";
import { getPropertyById } from "@/lib/data/mock-data";
import { cn } from "@/lib/utils";

type Filter = "all" | LeadChannel;

export function LeadInbox() {
  const [filter, setFilter] = useState<Filter>("all");
  const [activeId, setActiveId] = useState(LEAD_THREADS[0]?.id ?? "");

  const threads = useMemo(
    () => LEAD_THREADS.filter((thread) => (filter === "all" ? true : thread.channel === filter)),
    [filter],
  );
  const active = threads.find((thread) => thread.id === activeId) ?? threads[0];
  const property = active ? getPropertyById(active.listingId) : undefined;

  return (
    <Reveal>
      <DeskToolbar meta="Demo sync · not a live carrier">
        <DeskPill active={filter === "all"} onClick={() => setFilter("all")}>
          All
        </DeskPill>
        <DeskPill active={filter === "sms"} onClick={() => setFilter("sms")}>
          SMS
        </DeskPill>
        <DeskPill active={filter === "facebook"} onClick={() => setFilter("facebook")}>
          Facebook
        </DeskPill>
        <DeskPill active={filter === "web"} onClick={() => setFilter("web")}>
          Web
        </DeskPill>
      </DeskToolbar>

      <div className="grid min-h-[420px] grid-cols-1 md:grid-cols-[220px_minmax(0,1fr)]">
        <ul className="border-b border-line md:border-b-0 md:border-r">
          {threads.map((thread) => (
            <li key={thread.id}>
              <button
                type="button"
                onClick={() => setActiveId(thread.id)}
                className={cn(
                  "w-full border-b border-line px-4 py-3 text-left last:border-b-0",
                  active?.id === thread.id ? "bg-rail" : "bg-paper hover:bg-mist/50",
                )}
              >
                <p className="text-[13px] font-semibold text-ink">{thread.name}</p>
                <p className="mt-0.5 text-[12px] font-medium text-mute">
                  {channelLabel(thread.channel)} · {thread.subject}
                </p>
              </button>
            </li>
          ))}
        </ul>

        {active ? (
          <div className="px-5 py-5 sm:px-6">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-[15px] font-semibold tracking-[-0.2px] text-ink">{active.name}</p>
                <p className="mt-0.5 text-[12px] font-medium text-mute">
                  {channelLabel(active.channel)} ·{" "}
                  {property ? shortAddress(property.address) : active.subject}
                </p>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard/showings">Open showings</Link>
              </Button>
            </div>

            <div className="mt-4 space-y-3">
              {active.messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "max-w-[86%] rounded-btn border border-line px-3.5 py-2.5 text-[13px] font-medium leading-5",
                    message.from === "agent" ? "ml-auto bg-rail text-ink" : "bg-mist text-ink",
                  )}
                >
                  <p>{message.body}</p>
                  <p className="mt-1 text-[11px] font-medium text-mute-2">
                    {message.from === "agent" ? "AI agent · instant" : "Lead"} ·{" "}
                    {new Date(message.at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="px-5 py-8 text-[14px] font-medium text-mute">No threads in this filter.</p>
        )}
      </div>
    </Reveal>
  );
}
