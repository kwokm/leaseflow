import Link from "next/link";
import type { Applicant } from "@/lib/data/mock-data";
import { getAiIncome, type AiIncomeScreen } from "@/lib/data/household-model";
import {
  aiIncomeSourceLabel,
  formatAiIncomeLine,
  formatGrossMonthly,
  fullName,
  householdTotals,
  type HouseholdTotals,
} from "@/lib/desk/household";
import { cn } from "@/lib/utils";

export function AiIncomeLine({
  applicant,
  screen,
  compact = false,
}: {
  applicant?: Applicant;
  screen?: AiIncomeScreen;
  compact?: boolean;
}) {
  const live = applicant?.incomeCheck;
  if (live?.monthlyGross != null) {
    const extras = [
      live.nameMatch === true ? "Match" : live.nameMatch === false ? "Mismatch" : null,
      live.recencyLabel,
    ]
      .filter(Boolean)
      .join(" · ");
    if (compact) {
      return (
        <span className="ai-income num text-[12px] font-semibold text-ink">
          {formatGrossMonthly(live.monthlyGross)}
        </span>
      );
    }
    return (
      <p className="text-[13px] font-medium leading-5 text-ink">
        <span className="ai-income">
          AI Income Check · {formatGrossMonthly(live.monthlyGross)} gross
        </span>
        {extras ? <span className="ai-income-src"> · {extras}</span> : null}
        <span className="mt-0.5 block text-[12px] font-medium text-mute-2">
          Read from your upload. You decide who to approve.
        </span>
      </p>
    );
  }

  const resolved = screen ?? (applicant ? getAiIncome(applicant.id) : undefined);
  if (!resolved) {
    if (live?.status === "pending" || live?.status === "claimed") {
      return (
        <p className="text-[13px] font-medium text-mute">Waiting for income check…</p>
      );
    }
    return null;
  }

  if (compact) {
    return (
      <span className="ai-income num text-[12px] font-semibold text-ink">
        {formatGrossMonthly(resolved.grossMonthly)}
      </span>
    );
  }

  return (
    <p className="text-[13px] font-medium leading-5 text-ink">
      <span className="ai-income">{formatAiIncomeLine(resolved)}</span>
      <span className="ai-income-src"> · {aiIncomeSourceLabel(resolved)}</span>
      <span className="mt-0.5 block text-[12px] font-medium text-mute-2">
        AI Income Check reads paystubs and statements. You decide who to approve.
      </span>
    </p>
  );
}

export function HouseholdSummary({
  totals,
  className,
}: {
  totals: HouseholdTotals;
  className?: string;
}) {
  const scores = totals.memberScores
    .map((row) => (typeof row.score === "number" ? String(row.score) : null))
    .filter(Boolean)
    .join(" · ");

  return (
    <div className={cn("min-w-0", className)}>
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="hh-pill">Household</span>
        <p className="text-[13px] font-semibold tracking-[-0.16px] text-ink">{totals.names}</p>
      </div>
      {totals.vsRent ? (
        <p className="mt-1 text-[13px] font-medium text-ink">
          {totals.vsRent}
        </p>
      ) : totals.combinedGrossMonthly ? (
        <p className="mt-1 text-[13px] font-medium text-ink">
          ${totals.combinedGrossMonthly.toLocaleString()} / mo combined
        </p>
      ) : null}
      <p className="mt-0.5 text-[12px] font-medium text-mute">
        {scores ? `LeaseScore ${scores}` : "LeaseScore —"}
        {typeof totals.householdScore === "number" ? ` · Household ${totals.householdScore}` : ""}
      </p>
    </div>
  );
}

export function PacketHouseholdChrome({
  applicant,
  members,
  packetLinks = true,
  hrefFor = (id: string) => `/dashboard/applications/${id}`,
}: {
  applicant: Applicant;
  members: Applicant[];
  packetLinks?: boolean;
  hrefFor?: (id: string) => string;
}) {
  if (members.length < 2) return null;
  const others = members.filter((row) => row.id !== applicant.id);
  const totals = householdTotals(members);
  const withLabel = others.map(fullName).join(", ");

  return (
    <div className="hh-chrome border-b border-line px-5 py-4 sm:px-6">
      <p className="text-[12px] font-medium uppercase tracking-[0.06em] text-mute-2">
        Applying with {withLabel} · co-tenants
      </p>
      <HouseholdSummary totals={totals} className="mt-2" />
      <ul className="mt-3 flex flex-wrap gap-2">
        {members.map((row) => {
          const current = row.id === applicant.id;
          const label = `${fullName(row)}${current ? " · this file" : ""}`;
          if (!packetLinks || current) {
            return (
              <li key={row.id} className={cn("desk-pill", current && "is-on")}>
                {label}
              </li>
            );
          }
          return (
            <li key={row.id}>
              <Link href={hrefFor(row.id)} className="desk-pill">
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
