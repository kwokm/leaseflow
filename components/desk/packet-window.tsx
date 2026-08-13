import { cn } from "@/lib/utils";

/** Hairline product window from the locked landing screenshot. */
export function PacketWindow({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-lg border border-line bg-paper shadow-window",
        className
      )}
    >
      <div className="flex h-10 items-center gap-[7px] border-b border-line bg-[#fafafa] px-3.5">
        <span className="h-3 w-3 rounded-full bg-[#E15C6B]" aria-hidden />
        <span className="h-3 w-3 rounded-full bg-[#F5B400]" aria-hidden />
        <span className="h-3 w-3 rounded-full bg-[#12A150]" aria-hidden />
        <span className="ml-1 truncate text-[13px] font-medium tracking-[-0.02em] text-ink">
          {title}
        </span>
      </div>
      {children}
    </section>
  );
}

export function DeskToolbar({
  children,
  meta,
}: {
  children: React.ReactNode;
  meta?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-11 flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-2">
      <div className="flex flex-wrap items-center gap-1.5">{children}</div>
      {meta ? <p className="text-[12px] font-medium text-mute-2">{meta}</p> : null}
    </div>
  );
}

export function DeskPill({
  active,
  children,
  onClick,
}: {
  active?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  const className = cn("desk-pill", active && "is-on");

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className} aria-pressed={active}>
        {children}
      </button>
    );
  }

  return <span className={className}>{children}</span>;
}
