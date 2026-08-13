import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

// 44px tall so every field is a comfortable touch target on mobile.
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-btn border border-line-2 bg-paper px-3 text-[15px] font-medium tracking-[-0.16px] text-ink",
          "placeholder:font-medium placeholder:text-mute-2",
          "file:mr-3 file:h-7 file:rounded-md file:border file:border-line-2 file:bg-mist file:px-2 file:text-[13px] file:font-medium file:text-ink-2",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink",
          "disabled:cursor-not-allowed disabled:bg-mist disabled:text-mute",
          "aria-[invalid=true]:border-no",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
