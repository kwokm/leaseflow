"use client";

import * as React from "react";
import { AdverseActionReceipt } from "@/components/desk/adverse-action-receipt";
import {
  noticesForApplication,
  saveAdverseActionNotice,
  type StoredAdverseActionNotice,
} from "@/lib/desk/adverse-action-store";

export function ApplicantAdverseActionNotices({
  applicationIds,
}: {
  applicationIds: string[];
}) {
  const [notices, setNotices] = React.useState<StoredAdverseActionNotice[]>([]);
  const idKey = applicationIds.filter(Boolean).join("|");

  React.useEffect(() => {
    const unique = [...new Set(idKey.split("|").filter(Boolean))];
    const local = unique.flatMap((id) => noticesForApplication(id));
    setNotices(dedupe(local));

    let cancelled = false;
    Promise.all(
      unique.map((id) =>
        fetch(`/api/applications/${id}/adverse-action`)
          .then((response) => (response.ok ? response.json() : null))
          .catch(() => null)
      )
    ).then((bodies) => {
      if (cancelled) return;
      for (const body of bodies) {
        const rows = (body as { notices?: StoredAdverseActionNotice[] } | null)?.notices;
        if (!rows?.length) continue;
        for (const notice of rows) saveAdverseActionNotice(notice);
      }
      setNotices(dedupe(unique.flatMap((id) => noticesForApplication(id))));
    });

    return () => {
      cancelled = true;
    };
  }, [idKey]);

  if (!notices.length) return null;

  return (
    <div className="space-y-4 border-t border-line px-5 py-5 sm:px-6">
      {notices.map((notice) => (
        <AdverseActionReceipt key={notice.noticeId} notice={notice} audience="applicant" />
      ))}
    </div>
  );
}

function dedupe(rows: StoredAdverseActionNotice[]): StoredAdverseActionNotice[] {
  const seen = new Set<string>();
  return rows
    .filter((row) => {
      if (seen.has(row.noticeId)) return false;
      seen.add(row.noticeId);
      return true;
    })
    .sort((a, b) => (a.sentAt < b.sentAt ? 1 : -1));
}
