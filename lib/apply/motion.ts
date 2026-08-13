/**
 * Apply-flow motion tokens. Claude Steep set — opacity and transform only.
 * Aligns with design/animations-rules-claude.md.
 */
import {
  durationEnter,
  durationExit,
  durationFast,
  durationInstant,
  durationSlow,
  easeDefault,
  easeOut,
  easePower3,
  shiftLg,
  shiftXl,
  staggerCap,
  staggerLoose,
} from "@/lib/motion/tokens";

export const EASE_OUT = easeOut;
export const EASE_DEFAULT = easeDefault;
export const EASE_POWER3 = easePower3;

export const DURATION = {
  instant: durationInstant,
  ui: durationFast,
  step: durationSlow,
  exit: durationExit,
  enter: durationEnter,
  reveal: durationSlow,
} as const;

export const STAGGER = staggerLoose;
export const STAGGER_CAP = staggerCap;

export const stepSlide = {
  enter: {
    opacity: 0,
    y: shiftXl,
  },
  center: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.step, ease: easePower3 },
  },
  leave: {
    opacity: 0,
    y: shiftLg,
    transition: { duration: DURATION.exit, ease: easeDefault },
  },
};

export const staggerContainer = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: STAGGER,
    },
  },
};

export const staggerItem = {
  hidden: { opacity: 0, y: shiftLg },
  show: (index = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: DURATION.step,
      ease: easePower3,
      delay: (index % STAGGER_CAP) * STAGGER,
    },
  }),
};

export const appear = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.ui, ease: easeOut },
  },
};
