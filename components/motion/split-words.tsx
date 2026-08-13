import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

/**
 * Masked word split. Always emit the same markup (no hydration mismatch).
 * `prefers-reduced-motion` skips the motion via CSS end-state.
 */
export function SplitWords({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  const parts = children.split(/(\s+)/);
  let wordIndex = 0;

  return (
    <span className={cn(className)}>
      {parts.map((part, index) => {
        if (/^\s+$/.test(part)) {
          return <span key={index}>{part}</span>;
        }

        const w = wordIndex % 8;
        wordIndex += 1;

        return (
          <span key={index} className="line-mask">
            <span data-word style={{ "--w": w } as CSSProperties}>
              {part}
            </span>
          </span>
        );
      })}
    </span>
  );
}
