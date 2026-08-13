"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { MessageSquare, Send, Wrench } from "lucide-react";
import {
  getApplicantById,
  getLastMessageAt,
  getPropertyById,
  mockThreads,
} from "@/lib/data/mock-data";

export default function MessagesPage() {
  const threads = [...mockThreads].sort(
    (a, b) => new Date(getLastMessageAt(b)).getTime() - new Date(getLastMessageAt(a)).getTime()
  );
  const [selectedId, setSelectedId] = useState(threads[0]?.id);

  const thread = threads.find((t) => t.id === selectedId) ?? threads[0];
  const applicant = thread ? getApplicantById(thread.applicantId) : undefined;
  const property = thread ? getPropertyById(thread.propertyId) : undefined;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-ink">Messages</h1>
        <p className="text-mute mt-1">Conversations with applicants</p>
      </div>

      {/* Stub notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
        <Wrench className="w-5 h-5 text-amber-600 mt-0.5" />
        <div>
          <div className="font-semibold text-amber-900">Preview — not yet connected</div>
          <div className="text-sm text-amber-800">
            Messaging is a stub in this prototype. Threads are mock data and sending is disabled.
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Thread list */}
        <Card className="lg:col-span-1">
          <CardContent className="p-0 divide-y">
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
                    "w-full text-left p-4 transition-colors",
                    active ? "bg-primary/5" : "hover:bg-mist"
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-ink truncate">
                      {person ? `${person.firstName} ${person.lastName}` : "Unknown applicant"}
                    </span>
                    {item.unread > 0 && (
                      <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground shrink-0">
                        {item.unread}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-mute-2 mt-0.5">{item.subject}</div>
                  <div className="text-sm text-mute mt-1 line-clamp-2">{last?.body}</div>
                  <div className="text-xs text-mute-3 mt-1">
                    {last ? new Date(last.sentAt).toLocaleDateString() : ""}
                  </div>
                </button>
              );
            })}
          </CardContent>
        </Card>

        {/* Thread view */}
        <Card className="lg:col-span-2 flex flex-col">
          {!thread ? (
            <CardContent className="flex-1 flex flex-col items-center justify-center py-16 text-center">
              <MessageSquare className="w-12 h-12 text-mute-3 mb-4" />
              <h3 className="text-lg font-semibold mb-1">No conversations yet</h3>
              <p className="text-sm text-mute">
                Messages from applicants will appear here.
              </p>
            </CardContent>
          ) : (
            <>
              <div className="border-b p-4">
                <div className="font-semibold">
                  {applicant ? `${applicant.firstName} ${applicant.lastName}` : "Applicant"}
                </div>
                <div className="text-sm text-mute">
                  {thread.subject}
                  {property ? ` · ${property.address}` : ""}
                </div>
                {applicant && (
                  <Link
                    href={`/dashboard/applications/${applicant.id}`}
                    className="text-sm text-primary hover:underline"
                  >
                    View application packet
                  </Link>
                )}
              </div>

              <CardContent className="flex-1 space-y-4 p-4">
                {thread.messages.map((message) => {
                  const fromLandlord = message.from === "landlord";
                  return (
                    <div
                      key={message.id}
                      className={cn("flex", fromLandlord ? "justify-end" : "justify-start")}
                    >
                      <div
                        className={cn(
                          "max-w-[80%] rounded-lg px-4 py-2 text-sm",
                          fromLandlord
                            ? "bg-primary text-primary-foreground"
                            : "bg-rail text-ink"
                        )}
                      >
                        <p>{message.body}</p>
                        <div
                          className={cn(
                            "text-xs mt-1",
                            fromLandlord ? "text-primary-foreground/70" : "text-mute-2"
                          )}
                        >
                          {new Date(message.sentAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>

              <div className="border-t p-4 flex items-center gap-2">
                <Input placeholder="Sending is not available in this prototype" disabled />
                <Button disabled>
                  <Send className="w-4 h-4 mr-2" />
                  Send
                </Button>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
