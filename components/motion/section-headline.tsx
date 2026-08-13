import { SplitWords } from "@/components/motion/split-words";

/** Two-tone landing headline: black lead slides 40px; gray secondary is split-text. */
export function SectionHeadline({
  lead,
  tone,
  className = "",
  id,
}: {
  lead: string;
  tone: string;
  className?: string;
  id?: string;
}) {
  return (
    <h2
      id={id}
      className={`text-[30px] font-medium leading-[1.08] tracking-[-0.6px] text-ink sm:text-[40px] sm:leading-[44px] sm:tracking-[-0.4px] ${className}`}
    >
      <span className="reveal-lead">{lead}</span>{" "}
      <SplitWords className="tone">{tone}</SplitWords>
    </h2>
  );
}
