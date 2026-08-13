"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { durationEnter, easePower3, shiftMd } from "@/lib/motion/tokens";

/** Page wash only — no Pattern B scale-down or brightness overlay. */
export function SpatialOrigin({ children }: { children: ReactNode }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
      {children}
    </div>
  );
}

export function SpatialMount({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: shiftMd }}
      animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
      transition={
        reduce ? { duration: 0.01 } : { duration: durationEnter, ease: easePower3 }
      }
    >
      {children}
    </motion.div>
  );
}

export function SpatialPane({
  paneKey,
  children,
  className,
}: {
  paneKey: string;
  children: ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      key={paneKey}
      className={className}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: shiftMd }}
      animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
      transition={
        reduce ? { duration: 0.01 } : { duration: durationEnter, ease: easePower3 }
      }
    >
      {children}
    </motion.div>
  );
}
