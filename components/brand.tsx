import { cn } from "@/lib/utils";

export function BrandMark({ size = 22, className }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden
      className={cn("shrink-0", className)}
    >
      <rect width="24" height="24" rx="6.5" fill="currentColor" />
      <rect
        x="6.2"
        y="5.2"
        width="11.6"
        height="13.6"
        rx="2"
        fill="none"
        stroke="#fff"
        strokeWidth="1.55"
      />
      <path d="M6.2 9.4h11.6" stroke="#fff" strokeWidth="1.55" />
    </svg>
  );
}

export function BrandWord({ className }: { className?: string }) {
  return (
    <span className={cn("text-[16px] font-semibold tracking-[-0.64px]", className)}>
      leaseflow
    </span>
  );
}
