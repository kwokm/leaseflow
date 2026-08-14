"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

/** In-view looping clock. Pauses off-screen. Reduced motion freezes on the finished frame. */
export function useDemoLoop(cycleMs = 11000) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (reduce) {
      setPhase(1);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting && entry.intersectionRatio >= 0.12),
      { threshold: [0, 0.12, 0.35] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduce]);

  useEffect(() => {
    if (reduce) {
      setPhase(1);
      return;
    }
    if (!visible) return;
    const started = performance.now();
    const id = window.setInterval(() => {
      setPhase(((performance.now() - started) % cycleMs) / cycleMs);
    }, 80);
    return () => window.clearInterval(id);
  }, [visible, reduce, cycleMs]);

  return {
    ref,
    phase: reduce ? 1 : phase,
    playing: Boolean(!reduce && visible),
    reduce: Boolean(reduce),
  };
}

export function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
}

/** Story is on during 0–0.88; 0.88–1 fades back to the start. Phase 1 is the finished frame. */
export function storyOn(phase: number, at: number): boolean {
  if (phase >= 1) return true;
  if (phase >= 0.88) return false;
  return phase >= at;
}

export function resetting(phase: number): boolean {
  return phase >= 0.88 && phase < 1;
}

export function countTo(phase: number, target: number, start = 0.04, end = 0.36): number {
  if (phase >= 1) return target;
  if (phase >= 0.88) return 0;
  if (phase >= end) return target;
  if (phase <= start) return 0;
  return Math.round(target * easeInOut((phase - start) / (end - start)));
}

export function wipeProgress(phase: number): number {
  if (phase >= 1) return 1;
  if (phase >= 0.88) return 0;
  if (phase < 0.12) return 0;
  if (phase > 0.42) return 1;
  return easeInOut((phase - 0.12) / 0.3);
}
