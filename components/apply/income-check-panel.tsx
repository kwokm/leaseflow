"use client";

import { useEffect, useMemo, useState } from "react";
import { enqueueIncomeCheckRequest, fetchIncomeChecks } from "@/lib/income/client";
import { reportFromIncomeChecks, type PublicIncomeCheck } from "@/lib/income/view";
import { AiDocCheck } from "@/components/docs/ai-check";
import type { ApplyState, LocalFile } from "@/lib/apply/types";
import type { IncomeDocKind } from "@/lib/income/extract";

const POLL_MS = 2500;

export function incomeFilesFromState(state: ApplyState): LocalFile[] {
  return [...state.paystubs, ...state.statements];
}

export async function attachIncomeCheck(
  file: LocalFile,
  kind: IncomeDocKind,
  state: ApplyState,
): Promise<LocalFile> {
  if (!file.pathname || file.incomeCheckId) return file;
  const applicantName = `${state.personal.firstName} ${state.personal.lastName}`.trim();
  const check = await enqueueIncomeCheckRequest({
    listingId: state.listingId,
    applicationId: state.applicationId,
    applicantName,
    docKind: kind,
    blobPath: file.pathname,
    fileName: file.name,
  });
  if (!check) return file;
  return { ...file, incomeCheckId: check.id };
}

export function useApplicationIncomeChecks(applicationId?: string): {
  checks: PublicIncomeCheck[];
  waiting: boolean;
} {
  const [checks, setChecks] = useState<PublicIncomeCheck[]>([]);

  useEffect(() => {
    if (!applicationId) {
      setChecks([]);
      return;
    }

    let active = true;
    let timer: number | undefined;

    const poll = async () => {
      const rows = await fetchIncomeChecks({ applicationId });
      if (!active) return;
      setChecks(rows);
      if (rows.some((row) => row.status === "pending" || row.status === "claimed")) {
        timer = window.setTimeout(poll, POLL_MS);
      }
    };

    void poll();
    return () => {
      active = false;
      if (timer) window.clearTimeout(timer);
    };
  }, [applicationId]);

  const waiting = checks.some((row) => row.status === "pending" || row.status === "claimed");
  return { checks, waiting };
}

export function useIncomeChecks(ids: string[]): {
  checks: PublicIncomeCheck[];
  waiting: boolean;
} {
  const [checks, setChecks] = useState<PublicIncomeCheck[]>([]);
  const key = ids.slice().sort().join(",");

  useEffect(() => {
    const currentIds = key ? key.split(",") : [];
    if (!currentIds.length) {
      setChecks([]);
      return;
    }

    let active = true;
    let timer: number | undefined;

    const poll = async () => {
      const rows = await fetchIncomeChecks({ ids: currentIds });
      if (!active) return;
      setChecks(rows);
      const pending = rows.some((row) => row.status === "pending" || row.status === "claimed");
      const missing = rows.length < currentIds.length;
      if (pending || missing) {
        timer = window.setTimeout(poll, POLL_MS);
      }
    };

    void poll();
    return () => {
      active = false;
      if (timer) window.clearTimeout(timer);
    };
  }, [key]);

  const waiting =
    Boolean(ids.length) &&
    (checks.length < ids.length ||
      checks.some((row) => row.status === "pending" || row.status === "claimed"));

  return { checks, waiting };
}

export function IncomeCheckPanel({
  state,
  embedded = false,
}: {
  state: ApplyState;
  embedded?: boolean;
}) {
  const ids = useMemo(
    () =>
      incomeFilesFromState(state)
        .map((file) => file.incomeCheckId)
        .filter((id): id is string => Boolean(id)),
    [state],
  );
  const uploaded = incomeFilesFromState(state).some((file) => file.pathname);
  const { checks, waiting } = useIncomeChecks(ids);
  const report = useMemo(() => reportFromIncomeChecks(checks), [checks]);

  if (!ids.length && !uploaded) return null;

  return (
    <AiDocCheck
      report={
        report.checkedCount
          ? report
          : {
              rows: [],
              passed: false,
              namePass: false,
              recencyPass: false,
              checkedCount: 0,
              live: true,
              waiting: true,
            }
      }
      scan={false}
      embedded={embedded}
      live
      waiting={waiting || !checks.length}
    />
  );
}
