"use client";

import * as React from "react";
import type { Property } from "@/lib/data/mock-data";
import type { StepErrors } from "@/lib/apply/validate";
import type { ApplyState } from "@/lib/apply/types";
import { cn } from "@/lib/utils";

export interface StepProps {
  state: ApplyState;
  patch: (partial: Partial<ApplyState>) => void;
  errors: StepErrors;
  property: Property;
  goTo: (step: number) => void;
}

/** Two-tone heading: the lead stays ink, the continuation drops to mute. */
export function StepHeading({ lead, tone }: { lead: string; tone: string }) {
  return (
    <h1 className="text-[28px] font-semibold leading-[1.1] tracking-[-0.7px] text-ink sm:text-[34px] sm:tracking-[-0.9px]">
      {lead}{" "}
      <span className="tone font-semibold">{tone}</span>
    </h1>
  );
}

export function Panel({
  title,
  description,
  children,
  className,
}: {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-lg border border-line bg-paper p-5 transition-[border-color,box-shadow] duration-200 ease-premium",
        className
      )}
    >
      {title && (
        <h2 className="text-[17px] font-semibold leading-tight tracking-[-0.3px] text-ink">
          {title}
        </h2>
      )}
      {description && (
        <p className="mt-1 text-[14px] font-medium leading-5 tracking-[-0.14px] text-mute">
          {description}
        </p>
      )}
      <div className={cn(title || description ? "mt-4" : undefined)}>{children}</div>
    </section>
  );
}

export function Note({
  children,
  tone = "mist",
}: {
  children: React.ReactNode;
  tone?: "mist" | "blue" | "warn";
}) {
  return (
    <p
      className={cn(
        "rounded-btn border px-3.5 py-3 text-[13px] font-medium leading-5 tracking-[-0.13px]",
        tone === "mist" && "border-line bg-mist text-mute",
        tone === "blue" && "border-transparent bg-blue-soft text-[#1b4fae]",
        tone === "warn" && "border-transparent bg-warn-bg text-[#7a5900]"
      )}
    >
      {children}
    </p>
  );
}

export function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-line py-2.5 last:border-b-0">
      <dt className="text-[14px] font-medium tracking-[-0.14px] text-mute">{label}</dt>
      <dd className="min-w-0 text-right text-[14px] font-medium tracking-[-0.14px] text-ink">
        {value}
      </dd>
    </div>
  );
}

export function FieldGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>;
}
