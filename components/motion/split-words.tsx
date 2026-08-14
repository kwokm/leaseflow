"use client";

import type { CSSProperties } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * Masked word split. Wrappers are paint-only — resting layout matches
 * unsplit text. Reduced motion renders the plain string (no split DOM).
 *
 * JSX is compacted so React does not insert whitespace text nodes.
 */
export function SplitWords({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <span className={className}>{children}</span>;
  }

  const words = children.trim().split(/\s+/);

  return (
    <span className={cn("split-words", className)}>
      {words.map((word, index) => (
        <span className="split-word" key={`${word}-${index}`}>{index > 0 ? " " : null}<span className="split-mask"><span className="split-rise" style={{ "--w": index % 8 } as CSSProperties}>{word}</span></span></span>
      ))}
    </span>
  );
}
