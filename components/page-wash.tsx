import { cn } from "@/lib/utils";

/**
 * Full-page lavender wash + pinstripes from the locked landing screenshot.
 * Used on landing, apply, and the owner desk so the product is one surface.
 */
export function PageWash({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-0 z-0 overflow-hidden bg-paper print:hidden",
        className
      )}
      aria-hidden
    >
      <div className="hero-wash hero-wash-shell" />
    </div>
  );
}
