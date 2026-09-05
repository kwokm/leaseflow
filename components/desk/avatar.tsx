import { avatarClass, initialsOf } from "@/lib/desk/display";
import { cn } from "@/lib/utils";

export function Avatar({
  firstName,
  lastName,
  large = false,
  className,
  photoUrl,
}: {
  firstName: string;
  lastName: string;
  large?: boolean;
  className?: string;
  photoUrl?: string;
}) {
  if (photoUrl) {
    return (
      <span className={cn("ava overflow-hidden", large && "ava-lg", className)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photoUrl} alt="" className="h-full w-full object-cover" />
      </span>
    );
  }
  return (
    <span
      aria-hidden
      className={cn("ava", large && "ava-lg", avatarClass(firstName, lastName), className)}
    >
      {initialsOf(firstName, lastName)}
    </span>
  );
}
