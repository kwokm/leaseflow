"use client";

import type { ReactNode } from "react";
import { useDemoPlay } from "@/lib/demos/loop";
import { cn } from "@/lib/utils";

export function DemoPlay({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const { ref, playing, reduce } = useDemoPlay();

  return (
    <div
      ref={ref}
      className={cn("demo-play px-5 py-4", playing && "is-playing", reduce && "is-frozen", className)}
      aria-hidden
    >
      {children}
    </div>
  );
}
