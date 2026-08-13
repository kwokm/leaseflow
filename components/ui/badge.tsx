import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[12px] font-medium leading-5 tracking-[-0.12px]",
  {
    variants: {
      variant: {
        default: "border-line bg-mist text-ink-2",
        outline: "border-line-2 bg-paper text-ink-2",
        secondary: "border-line bg-rail text-mute",
        blue: "border-transparent bg-blue-soft text-blue",
        ok: "border-transparent bg-ok-bg text-ok",
        warn: "border-transparent bg-warn-bg text-[#8a6400]",
        destructive: "border-transparent bg-no-bg text-no",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
