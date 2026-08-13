/**
 * Apply-flow motion tokens. Quiet and expensive — no springs, no bounce.
 * Durations stay in the 150–250ms band except the credit-score reveal.
 */
export const EASE_OUT = [0.22, 1, 0.36, 1] as const;
export const EASE_IN_OUT = [0.4, 0, 0.2, 1] as const;

export const DURATION = {
  micro: 0.16,
  ui: 0.2,
  step: 0.24,
  exit: 0.18,
  reveal: 0.64,
} as const;

export const STAGGER = 0.036;

export const stepSlide = {
  enter: (direction: number) => ({
    x: direction * 16,
  }),
  center: {
    x: 0,
    transition: { duration: DURATION.step, ease: EASE_OUT },
  },
  leave: (direction: number) => ({
    x: direction * -12,
    transition: { duration: DURATION.exit, ease: EASE_IN_OUT },
  }),
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
  hidden: { opacity: 0, y: 8 },
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
