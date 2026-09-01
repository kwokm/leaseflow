/**
 * Apply-flow motion tokens. Quiet and expensive — no springs, no bounce.
 * Aligns with design/animations-rules.md.
 */
import { durationInteraction, easeReveal, easeSpatial } from "@/lib/motion/tokens";

export const EASE_OUT = easeReveal;
export const EASE_IN_OUT = easeSpatial;

export const DURATION = {
  micro: 0.16,
  ui: durationInteraction,
  step: 0.55,
  exit: 0.28,
  reveal: 0.7,
} as const;

export const STAGGER = 0.12;

export const stepSlide = {
  enter: {
    opacity: 0,
    scale: 0.9,
    y: 20,
  },
  center: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: DURATION.step, ease: easeSpatial },
  },
  leave: {
    opacity: 0,
    scale: 0.96,
    y: 8,
    transition: { duration: DURATION.exit, ease: easeSpatial },
  },
};

export const staggerContainer = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: STAGGER,
      delayChildren: 0.04,
    },
  },
};

export const staggerItem = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.step, ease: EASE_OUT },
  },
};

export const appear = {
  hidden: { opacity: 0, y: 6 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.ui, ease: EASE_OUT },
  },
};
