import { cn } from "@/lib/utils";

/** Locked product window from design/attio-inspired `.window` / `.window-bar`. */
export function PacketWindow({
  title,
  meta,
  children,
  className,
}: {
  title: string;
  meta?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("window", className)}>
      <div className="window-bar">
        <span className="tl tl-r" aria-hidden />
        <span className="tl tl-y" aria-hidden />
        <span className="tl tl-g" aria-hidden />
        <span className="desk-chrome-title ml-1 min-w-0 flex-1 truncate">{title}</span>
        {meta ? <span className="desk-chrome-meta shrink-0">{meta}</span> : null}
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
    <div className="desk-chrome">
      <div className="flex flex-wrap items-center gap-1.5">{children}</div>
      {meta ? <p className="desk-chrome-meta">{meta}</p> : null}
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
