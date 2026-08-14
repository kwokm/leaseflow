"use client";

import type { ReactNode } from "react";
import { useDemoPlay } from "@/lib/demos/loop";
import { cn } from "@/lib/utils";

export function DemoPlay({
  children,
  className,
  flush = false,
}: {
  children: ReactNode;
  className?: string;
  flush?: boolean;
}) {
  const { ref, playing, reduce } = useDemoPlay();

  return (
    <div
      ref={ref}
      className={cn(
        "demo-play",
        !flush && "px-5 py-4",
        playing && "is-playing",
        reduce && "is-frozen",
        className,
      )}
      aria-hidden
    >
      {children}
    </div>
  );
}
