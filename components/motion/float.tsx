import type { ReactNode } from "react";

/** Passthrough — Pattern C hero float is stripped on this branch. */
export function Float({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}
