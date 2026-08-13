"use client";

import Link from "next/link";
import { useLayoutEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const WORDS = ["Welcome", "to", "the", "packet."];

export function HeroCopy({
  deskHref,
  applyHref,
}: {
  deskHref: string;
  applyHref: string;
}) {
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    setReady(true);
  }, []);

  return (
    <div className={cn("hero-copy", ready && "is-ready")}>
      <h1 id="hero-title" className={cn(!ready && "invisible")}>
        {WORDS.map((word, index) => (
          <span key={word} className="hero-word-mask">
            <span className="hero-word" style={{ ["--w" as string]: index }}>
              {word}
              {index < WORDS.length - 1 ? "\u00A0" : ""}
            </span>
          </span>
        ))}
      </h1>
      <p className="hero-sub">
        LeaseFlow is the screening service that collects applications, runs credit and
        background, and hands you a LeaseScore you can approve or decline.
      </p>
      <div className="hero-ctas">
        <Button asChild size="cta" className="group">
          <Link href={deskHref}>Open the desk</Link>
        </Button>
        <Button asChild variant="outline" size="cta">
          <Link href={applyHref}>Apply as renter</Link>
        </Button>
      </div>
    </div>
  );
}
