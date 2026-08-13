import { cn } from "@/lib/utils";

/**
 * The locked hero wash, reused. White paper field + the same 62% bottom bloom
 * as design/attio-inspired `.hero-wash`. No second palette.
 */
export function PageWash({
  quiet = false,
  className,
}: {
  quiet?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-0 z-0 overflow-hidden bg-paper print:hidden",
        className
      )}
      aria-hidden
    >
      <div className={cn("hero-wash", !quiet && "hero-wash-shell", quiet && "opacity-70")} />
    </div>
  );
}
