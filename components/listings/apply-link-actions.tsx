"use client";

import { useState } from "react";
import { Check, Copy, MailPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

function applyUrl(listingId: string): string {
  const path = `/apply/${listingId}`;
  return typeof window === "undefined" ? path : `${window.location.origin}${path}`;
}

export function ApplyLinkActions({
  listingId,
  address,
  compact = false,
}: {
  listingId: string;
  address: string;
  compact?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(applyUrl(listingId));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  function inviteRenter() {
    const subject = `Apply for ${address}`;
    const body = `Complete your Leaseproof application here:\n\n${applyUrl(listingId)}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button type="button" size={compact ? "sm" : "touch"} onClick={copyLink}>
        {copied ? <Check className="h-4 w-4" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
        {copied ? "Copied" : "Copy apply link"}
      </Button>
      <Button
        type="button"
        variant="outline"
        size={compact ? "sm" : "touch"}
        onClick={inviteRenter}
      >
        <MailPlus className="h-4 w-4" aria-hidden />
        Invite renter
      </Button>
      <span className="sr-only" aria-live="polite">
        {copied ? "Apply link copied" : ""}
      </span>
    </div>
  );
}
