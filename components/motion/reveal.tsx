"use client";

import type { ReactNode } from "react";
import { InView } from "@/components/motion/in-view";
import { cn } from "@/lib/utils";

type Shift = "sm" | "md" | "lg" | "xl";

export function Reveal({
  children,
  className,
  shift = "xl",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  shift?: Shift;
}) {
  return (
    <InView className={cn("reveal-block", `reveal-shift-${shift}`, className)}>
      {children}
    </InView>
  );
}

export function RevealStagger({
  children,
  className,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "ol";
}) {
  return (
    <InView as={as} className={cn("reveal-stagger", className)}>
      {children}
    </InView>
  );
}

export function RevealItem({
  children,
  className,
  as = "div",
  motion = "slide",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "li" | "article";
  motion?: "slide" | "spatial";
}) {
  const Tag = as;
  return (
    <Tag className={cn(motion === "spatial" ? "reveal-spatial" : "reveal-item", className)}>
      {children}
    </Tag>
  );
}
