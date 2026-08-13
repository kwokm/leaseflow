import type { ApplicationStatus } from "@/lib/data/mock-data";
import { statusClass, statusLabel } from "@/lib/desk/display";
import { cn } from "@/lib/utils";

export function StatusPill({
  status,
  className,
}: {
  status: ApplicationStatus;
  className?: string;
}) {
  return <span className={cn(statusClass(status), className)}>{statusLabel(status)}</span>;
}
