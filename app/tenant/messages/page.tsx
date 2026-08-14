"use client";

import { DeskToolbar } from "@/components/desk/packet-window";
import { Reveal } from "@/components/motion/reveal";
import { getLastMessageAt, getPropertyById, mockThreads } from "@/lib/data/mock-data";
import { shortAddress } from "@/lib/desk/display";
import { TENANT_APPLICANT_ID } from "@/lib/tenant/session";
import { cn } from "@/lib/utils";

export default function TenantMessagesPage() {
  const threads = mockThreads
    .filter((thread) => thread.applicantId === TENANT_APPLICANT_ID)
    .sort((a, b) => new Date(getLastMessageAt(b)).getTime() - new Date(getLastMessageAt(a)).getTime());
  const thread = threads[0];
  const property = thread ? getPropertyById(thread.propertyId) : undefined;

  return (
    <Reveal>
      <DeskToolbar meta="Preview · sending is off">
        <span className="desk-pill is-on">Inbox</span>
      </DeskToolbar>
      {thread ? (
        <div className="px-5 py-5 sm:px-6">
          <p className="text-[14px] font-semibold text-ink">{thread.subject}</p>
          <p className="mt-0.5 text-[12px] text-mute">
            {property ? shortAddress(property.address) : "Listing"}
          </p>
          <div className="mt-4 space-y-3">
            {thread.messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "max-w-[80%] rounded-btn border border-line px-3.5 py-2.5 text-[13px]",
                  message.from === "applicant" ? "ml-auto bg-rail" : "bg-mist",
                )}
              >
                <p>{message.body}</p>
                <p className="mt-1 text-[11px] text-mute-2">
                  {new Date(message.sentAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="px-5 py-8 text-[14px] font-medium text-mute">No messages yet.</p>
      )}
    </Reveal>
  );
}
