"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

/** IntersectionObserver play/pause only. Animations are CSS. No setInterval. */
export function useDemoPlay() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (reduce) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setPlaying(entry.isIntersecting && entry.intersectionRatio >= 0.12),
      { threshold: [0, 0.12, 0.35] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduce]);

  return {
    ref,
    playing: Boolean(!reduce && playing),
    reduce: Boolean(reduce),
  };
}
