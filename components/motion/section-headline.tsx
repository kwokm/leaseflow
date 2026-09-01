import { SplitWords } from "@/components/motion/split-words";

/** Black lead splits word-by-word; grey secondary floats up as one block. */
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
      <SplitWords>{lead}</SplitWords>{" "}
      <span className="tone reveal-tone">{tone}</span>
    </h2>
  );
}
