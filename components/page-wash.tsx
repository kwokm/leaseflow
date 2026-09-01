import { cn } from "@/lib/utils";

/**
 * Locked 62% bottom bloom. Parent must be `position: relative` with a white
 * background — this is not a full-viewport overlay.
 */
export function PageWash({ className }: { className?: string }) {
  return <div className={cn("hero-wash", className)} aria-hidden />;
}
