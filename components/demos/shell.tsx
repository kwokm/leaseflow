import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function DemoShell({
  children,
  className,
  reset,
}: {
  children: ReactNode;
  className?: string;
  reset?: boolean;
}) {
  return (
    <div
      className={cn("demo-stage px-5 py-4", reset && "is-reset", className)}
      aria-hidden
    >
      {children}
    </div>
  );
}

export function DemoLine({
  on,
  children,
  className,
}: {
  on: boolean;
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("demo-row", on && "is-on", className)}>{children}</div>;
}
