"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

type InViewTag = "div" | "h2" | "ol" | "ul" | "section" | "footer";

export function InView({
  children,
  className,
  as: Tag = "div",
  id,
}: {
  children: ReactNode;
  className?: string;
  as?: InViewTag;
  id?: string;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduce) {
      setVisible(true);
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: "0px 0px -20% 0px", threshold: 0 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduce]);

  return (
    <Tag
      // Polymorphic host: div / h2 / ol / section / footer all accept a ref.
      ref={ref as never}
      id={id}
      className={cn(className, visible && "is-visible")}
    >
      {children}
    </Tag>
  );
}
