import { cn } from "@/lib/utils";

/**
 * Lavender page wash ported from design/attio-inspired/styles.css.
 * Same bloom as the landing hero: radial at the bottom, pinstripes, white fade
 * only at the top of the bloom. The field above stays --wash, never gray.
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
      className={cn("page-wash print:hidden", quiet && "page-wash-quiet", className)}
      aria-hidden
    >
      <div className="page-wash-bloom" />
    </div>
  );
}
