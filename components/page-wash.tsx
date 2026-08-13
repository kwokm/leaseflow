import { cn } from "@/lib/utils";

/**
 * Lavender page wash ported from design/attio-inspired/styles.css.
 * `quiet` keeps more white in the veil so forms and the desk stay readable.
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
    />
  );
}
