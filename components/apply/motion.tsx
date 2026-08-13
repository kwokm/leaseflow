"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  appear,
  DURATION,
  EASE_OUT,
  STAGGER_CAP,
  staggerItem,
  stepSlide,
} from "@/lib/apply/motion";

export function StepTransition({
  step,
  children,
}: {
  step: number;
  direction?: number;
  children: React.ReactNode;
}) {
  const reduced = useReducedMotion();

  if (reduced) {
    return (
      <motion.div
        key={step}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.01 }}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={step}
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

/** Staggers direct children on step enter. Cap 8 so late fields do not wait. */
export function StepBody({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion();

  if (reduced) {
    return <div className="space-y-5">{children}</div>;
  }

  return (
    <div className="space-y-5">
      {React.Children.map(children, (child, index) => (
        <motion.div
          key={index}
          initial="hidden"
          animate="show"
          custom={index % STAGGER_CAP}
          variants={staggerItem}
        >
          {child}
        </motion.div>
      ))}
    </div>
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
