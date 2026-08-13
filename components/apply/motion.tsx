"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  appear,
  DURATION,
  EASE_OUT,
  staggerContainer,
  staggerItem,
  stepSlide,
} from "@/lib/apply/motion";

export function StepTransition({
  step,
  direction,
  children,
}: {
  step: number;
  direction: number;
  children: React.ReactNode;
}) {
  const reduced = useReducedMotion();

  if (reduced) {
    return <div key={step}>{children}</div>;
  }

  return (
    <AnimatePresence mode="wait" custom={direction} initial={false}>
      <motion.div
        key={step}
        custom={direction}
        variants={stepSlide}
        initial="enter"
        animate="center"
        exit="leave"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/** Staggers direct children on step enter. The wrapper itself does not fade. */
export function StepBody({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion();

  if (reduced) {
    return <div className="space-y-5">{children}</div>;
  }

  return (
    <motion.div
      className="space-y-5"
      variants={staggerContainer}
      initial="hidden"
      animate="show"
    >
      {React.Children.map(children, (child, index) => (
        <motion.div key={index} variants={staggerItem}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

export function Appear({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotion();

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      variants={appear}
      initial="hidden"
      animate="show"
    >
      {children}
    </motion.div>
  );
}

export function Fade({
  show,
  children,
  className,
}: {
  show: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotion();

  return (
    <AnimatePresence>
      {show &&
        (reduced ? (
          <div className={className}>{children}</div>
        ) : (
          <motion.div
            className={className}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DURATION.ui, ease: EASE_OUT }}
          >
            {children}
          </motion.div>
        ))}
    </AnimatePresence>
  );
}
