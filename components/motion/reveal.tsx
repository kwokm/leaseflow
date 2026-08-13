import {
  Children,
  cloneElement,
  isValidElement,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from "react";
import { staggerCap } from "@/lib/motion/tokens";

type Shift = "sm" | "md" | "lg" | "xl";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  i?: number;
  shift?: Shift;
  as?: ElementType;
};

function revealStyle(i: number): CSSProperties {
  return { ["--i" as string]: i % staggerCap };
}

/** Scroll reveal. CSS owns the motion; RevealRoot toggles `.is-visible`. */
export function Reveal({
  children,
  className,
  delay = 0,
  i,
  shift = "xl",
  as: Comp = "div",
}: RevealProps) {
  const index = i ?? Math.round(delay / 0.15);

  return (
    <Comp data-reveal="" data-shift={shift} className={className} style={revealStyle(index)}>
      {children}
    </Comp>
  );
}

export function RevealStagger({
  children,
  className,
  as: Comp = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "ol";
}) {
  return (
    <Comp className={className}>
      {Children.map(children, (child, index) => {
        if (!isValidElement<{ i?: number }>(child)) return child;
        return cloneElement(child, { i: index % staggerCap });
      })}
    </Comp>
  );
}

export function RevealItem({
  children,
  className,
  as: Comp = "div",
  i = 0,
  shift = "xl",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "li" | "article";
  i?: number;
  shift?: Shift;
}) {
  return (
    <Comp data-reveal="" data-shift={shift} className={className} style={revealStyle(i)}>
      {children}
    </Comp>
  );
}
