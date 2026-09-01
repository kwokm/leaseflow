"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { durationFloat } from "@/lib/motion/tokens";

export function Float({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      animate={{ y: [-10, 10] }}
      transition={{
        duration: durationFloat,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
      }}
    >
      {children}
    </motion.div>
  );
}
