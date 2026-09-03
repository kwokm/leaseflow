import { cn } from "@/lib/utils";

/** Screenshot card: title left, meta right, hairline under. No traffic lights. */
export function PacketWindow({
  title,
  meta,
  stamp,
  children,
  className,
}: {
  title: string;
  meta?: string;
  /** Marketing / Jane Doe illustrations — not a real applicant. */
  stamp?: "SAMPLE";
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("window", stamp && "is-sample", className)}>
      <div className="card-head">
        <span className="card-head-title">{title}</span>
        {stamp || meta ? (
          <span className="card-head-meta">
            {stamp ? <span className="sample-stamp">{stamp}</span> : null}
            {meta ? <span>{meta}</span> : null}
          </span>
        ) : null}
      </div>
      {stamp ? (
        <p className="sample-banner" role="note">
          SAMPLE — not a real applicant
        </p>
      ) : null}
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
