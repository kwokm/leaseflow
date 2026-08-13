"use client";

import { useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/desk/avatar";
import { DeskToolbar } from "@/components/desk/packet-window";
import { Button } from "@/components/ui/button";
import {
  getApplicantById,
  getLastMessageAt,
  getPropertyById,
  mockThreads,
} from "@/lib/data/mock-data";
import { shortAddress } from "@/lib/desk/display";
import { Reveal } from "@/components/motion/reveal";
import { SpatialPane } from "@/components/motion/spatial";
import { cn } from "@/lib/utils";

export default function MessagesPage() {
  const threads = [...mockThreads].sort(
    (a, b) => new Date(getLastMessageAt(b)).getTime() - new Date(getLastMessageAt(a)).getTime()
  );
  const [selectedId, setSelectedId] = useState(threads[0]?.id);
  const thread = threads.find((item) => item.id === selectedId) ?? threads[0];
  const applicant = thread ? getApplicantById(thread.applicantId) : undefined;
  const property = thread ? getPropertyById(thread.propertyId) : undefined;

  return (
    <Reveal>
      <DeskToolbar meta="Preview · sending is off">
        <span className="desk-pill is-on">Inbox</span>
      </DeskToolbar>
      <div className="grid min-h-[480px] grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)]">
        <div className="group/threads border-b border-line lg:border-b-0 lg:border-r">
          {threads.map((item) => {
            const person = getApplicantById(item.applicantId);
            const last = item.messages[item.messages.length - 1];
            const active = thread?.id === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedId(item.id)}
                aria-current={active ? "true" : undefined}
                className={cn(
                  "flex w-full items-start gap-2.5 border-b border-line px-4 py-3 text-left transition-opacity duration-200 ease-out",
                  active ? "bg-[#f4f0f8]" : "group-hover/threads:opacity-90 hover:!opacity-100"
                )}
              >
                {person ? (
                  <Avatar firstName={person.firstName} lastName={person.lastName} />
                ) : null}
                <span className="min-w-0">
                  <span className="block truncate text-[13px] font-medium text-ink">
                    {person ? `${person.firstName} ${person.lastName}` : "Applicant"}
                  </span>
                  <span className="mt-0.5 block truncate text-[12px] text-mute">
                    {last?.body}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex min-w-0 flex-col">
          {thread && (
            <SpatialPane paneKey={thread.id} className="flex min-h-0 flex-1 flex-col">
              <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3">
                <div>
                  <p className="text-[14px] font-semibold text-ink">
                    {applicant ? `${applicant.firstName} ${applicant.lastName}` : "Applicant"}
                  </p>
                  <p className="text-[12px] text-mute">
                    {thread.subject}
                    {property ? ` · ${shortAddress(property.address)}` : ""}
                  </p>
                </div>
                {applicant && (
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/dashboard/applications/${applicant.id}`}>Open packet</Link>
                  </Button>
                )}
              </div>
              <div className="flex-1 space-y-3 px-5 py-4">
                {thread.messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "max-w-[80%] rounded-btn border border-line px-3.5 py-2.5 text-[13px]",
                      message.from === "landlord" ? "ml-auto bg-rail" : "bg-mist"
                    )}
                  >
                    <p>{message.body}</p>
                    <p className="mt-1 text-[11px] text-mute-2">
                      {new Date(message.sentAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </SpatialPane>
          )}
        </div>
      </div>
    </Reveal>
  );
}
