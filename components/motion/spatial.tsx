"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { durationSpatial, easeSpatial } from "@/lib/motion/tokens";

/** Pattern B origin: page wash scales down, darkens, and rounds. */
export function SpatialOrigin({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();

  if (reduce) {
    return (
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      initial={{ scale: 1, borderRadius: 0 }}
      animate={{ scale: 0.96, borderRadius: 16 }}
      transition={{ duration: durationSpatial, ease: easeSpatial }}
      style={{ transformOrigin: "50% 50%" }}
    >
      {children}
      <motion.div
        className="absolute inset-0 bg-[#1C1D1F]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.06 }}
        transition={{ duration: durationSpatial, ease: easeSpatial }}
      />
    </motion.div>
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

  if (reduce) {
    return (
      <motion.div
        className={className}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.1 }}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: durationSpatial, ease: easeSpatial }}
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
      initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: 20 }}
      animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
      transition={
        reduce
          ? { duration: 0.1 }
          : { duration: durationSpatial, ease: easeSpatial }
      }
    >
      {children}
    </motion.div>
  );
}
