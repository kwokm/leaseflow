import { avatarClass, initialsOf } from "@/lib/desk/display";
import { cn } from "@/lib/utils";

export function Avatar({
  firstName,
  lastName,
  large = false,
  className,
}: {
  firstName: string;
  lastName: string;
  large?: boolean;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn("ava", large && "ava-lg", avatarClass(firstName, lastName), className)}
    >
      {initialsOf(firstName, lastName)}
    </span>
  );
}
