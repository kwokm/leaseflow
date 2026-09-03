"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { easePower3 } from "@/lib/motion/tokens";
import {
  type DocCheckReport,
  type DocCheckRow,
} from "@/lib/docs/ai-check";
import { cn } from "@/lib/utils";

const SCAN_S = 0.7;

function formatGross(cents: number | null | undefined): string | null {
  if (cents == null) return null;
  return `$${Math.round(cents / 100).toLocaleString()} / mo`;
}

function Pill({
  ok,
  children,
}: {
  ok: boolean;
  children: React.ReactNode;
}) {
  return (
    <span className={cn("status", ok ? "status-ok" : "status-no")}>{children}</span>
  );
}

function Row({ row, delay }: { row: DocCheckRow; delay: number }) {
  const reduced = useReducedMotion();
  const gross = formatGross(row.monthlyGrossCents);
  const waiting = Boolean(row.waiting);
  const errored = Boolean(row.errored);

  return (
    <motion.li
      initial={reduced ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: SCAN_S, ease: easePower3, delay }}
      className="flex flex-col gap-2 border-b border-line py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="min-w-0">
        <p className="text-[13px] font-medium text-ink">
          {row.kindLabel}
          {row.extra ? <span className="ml-2 text-[12px] text-mute">Sample</span> : null}
          {row.source === "live" && !waiting && !errored ? (
            <span className="ml-2 text-[12px] text-mute">{row.readLabel ?? "Read from your upload"}</span>
          ) : null}
        </p>
        <p className="mt-0.5 truncate text-[12px] text-mute">{row.fileName}</p>
        <p className="mt-0.5 text-[12px] text-mute">
          {waiting
            ? "Waiting for income check…"
            : errored
              ? "Could not read this file"
              : `${row.detectedName} · ${row.periodLabel}${gross ? ` · ${gross}` : ""}${
                  row.employer ? ` · ${row.employer}` : ""
                }`}
        </p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {waiting ? (
          <span className="status">Waiting</span>
        ) : errored ? (
          <span className="status status-no">Unread</span>
        ) : (
          <>
            <Pill ok={row.nameMatch}>{row.nameMatch ? "Match" : "Mismatch"}</Pill>
            <Pill ok={row.recency === "current"}>{row.recencyLabel}</Pill>
          </>
        )}
      </div>
    </motion.li>
  );
}

export function AiDocCheck({
  report,
  onToggleSample,
  showSample = false,
  scan = true,
  compact = false,
  embedded = false,
  live = false,
  waiting = false,
}: {
  report: DocCheckReport;
  onToggleSample?: () => void;
  showSample?: boolean;
  scan?: boolean;
  compact?: boolean;
  embedded?: boolean;
  live?: boolean;
  waiting?: boolean;
}) {
  const reduced = useReducedMotion();
  const [ready, setReady] = useState(!scan || Boolean(reduced));
  const isLive = live || Boolean(report.live);
  const isWaiting = waiting || Boolean(report.waiting);

  useEffect(() => {
    if (!scan || reduced) {
      setReady(true);
      return;
    }
    setReady(false);
    const timer = window.setTimeout(() => setReady(true), SCAN_S * 1000);
    return () => window.clearTimeout(timer);
  }, [scan, reduced, report.checkedCount]);

  if (compact) {
    return (
      <div>
        <p className="text-[12px] font-medium text-mute-2">AI Income Check</p>
        <p className="mt-0.5 text-[13px] font-medium text-ink">
          {isWaiting
            ? "Waiting for income check…"
            : isLive
              ? "Read from your upload"
              : report.passed
                ? "Income documents match"
                : "Income documents need a look"}
        </p>
        <p className="mt-0.5 text-[12px] text-mute">
          AI Income Check reads paystubs and statements. You decide who to approve.
        </p>
      </div>
    );
  }

  return (
    <section className={embedded ? undefined : "rounded-lg border border-line bg-paper p-5 shadow-window"}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.06em] text-mute-2">
            AI Income Check
          </p>
          <h2 className="mt-1 text-[17px] font-semibold tracking-[-0.3px] text-ink">
            Income documents
          </h2>
          <p className="mt-1 text-[13px] font-medium text-mute">
            AI Income Check reads paystubs and statements. You decide who to approve.
          </p>
        </div>
        {ready && !isWaiting ? (
          <span className={cn("status", report.passed ? "status-ok" : report.rows.length ? "status-no" : "")}>
            {isLive ? "Read from your upload" : report.passed ? "Pass" : "Issues"}
          </span>
        ) : null}
      </div>

      {!ready ? (
        <div className="mt-5" aria-live="polite" aria-busy="true">
          <p className="text-[13px] font-medium text-ink">
            Reading {report.checkedCount || "income"} document
            {report.checkedCount === 1 ? "" : "s"}…
          </p>
          <div className="mt-3 h-px overflow-hidden bg-line">
            <motion.div
              className="h-px origin-left bg-ink"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: SCAN_S, ease: easePower3 }}
            />
          </div>
        </div>
      ) : (
        <>
          {isWaiting && report.rows.length === 0 ? (
            <p className="mt-4 text-[13px] font-medium text-mute" aria-live="polite">
              Waiting for income check…
            </p>
          ) : report.rows.length === 0 ? (
            <p className="mt-4 text-[13px] font-medium text-mute">No income documents to check.</p>
          ) : (
            <ul className="mt-2">
              {report.rows.map((row, index) => (
                <Row key={row.id} row={row} delay={Math.min(index, 7) * 0.08} />
              ))}
            </ul>
          )}

          <p className="mt-3 text-[12px] text-mute-2">
            {isLive
              ? isWaiting
                ? "The Mac Studio worker is reading this upload. You can keep going."
                : "Read from your upload — not a verification or an approval."
              : report.passed
                ? "All names match the applicant and recency rules pass."
                : "Happy-path dummy files still pass. This preview does not block submit."}
          </p>

          {onToggleSample ? (
            <button
              type="button"
              onClick={onToggleSample}
              className="mt-3 text-[12px] font-medium text-mute underline-offset-2 transition-colors duration-200 ease-out hover:text-ink hover:underline"
            >
              {showSample ? "Hide sample mismatch" : "Preview a stale mismatch example"}
            </button>
          ) : null}
        </>
      )}
    </section>
  );
}

export function AiDocCheckCompact({ report }: { report: DocCheckReport }) {
  return <AiDocCheck report={report} scan={false} compact />;
}
