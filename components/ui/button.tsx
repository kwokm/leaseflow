import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/*
 * Reference buttons: 36px tall, radius 10, 14/500, no shadow, never pills.
 * `touch` bumps the height to 44px for the primary controls on small screens.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-btn text-[14px] font-medium leading-none tracking-[-0.16px] transition-[background-color,border-color,color,transform] duration-200 ease-out active:translate-y-px focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:pointer-events-none disabled:opacity-45 disabled:active:translate-y-0",
  {
    variants: {
      variant: {
        // Fill #202124 / #F3F4F6 / border #4E5967
        default: "bg-fill text-fill-text border border-slate hover:bg-[#161718]",
        // Ghost #FFF / #2D3238 / border #C9D0D9
        outline: "bg-paper text-ink-2 border border-line-2 hover:bg-mist",
        ghost: "bg-transparent text-ink-2 border border-transparent hover:bg-rail",
        subtle: "bg-mist text-ink-2 border border-line hover:bg-rail",
        destructive: "bg-no text-white border border-[#c94b5a] hover:bg-[#d2505f]",
        // On-dark pairings from the reference footer / close section
        dark: "bg-dark text-on-dark border border-dark-2 hover:bg-[#161616]",
        darkFill:
          "bg-dark-2 text-on-dark border border-[rgba(80,89,103,0.5)] hover:bg-[#353b42]",
        link: "text-ink underline-offset-4 hover:underline border border-transparent",
      },
      size: {
        default: "h-9 px-3",
        sm: "h-9 px-3",
        lg: "h-9 px-4",
        touch: "h-11 px-4",
        // 44px target on touch screens, the reference's 36px from sm up
        cta: "h-11 px-4 sm:h-9 sm:px-3",
        icon: "h-9 w-9 p-0",
        iconTouch: "h-11 w-11 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
