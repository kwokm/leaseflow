"use client";

import { useEffect, useMemo, useState } from "react";
import type { Applicant, ApplicationStatus } from "@/lib/data/mock-data";
import { getAllApplications } from "@/lib/data/mock-data";
import { loadSubmissions } from "@/lib/apply/storage";
import { submissionApplicant } from "@/lib/apply/to-packet";
import { sortDeskFirst } from "@/lib/desk/display";
import { ApplicationTable } from "@/components/desk/application-table";
import { DeskPill, DeskToolbar } from "@/components/desk/packet-window";

type PropertyFilter = "all" | string;
type StatusFilter = "all" | "received" | ApplicationStatus;

export function ApplicationDesk({
  propertyId,
  extras = false,
  chrome = true,
}: {
  propertyId?: string;
  extras?: boolean;
  chrome?: boolean;
}) {
  const [submitted, setSubmitted] = useState<Applicant[]>([]);
  const [propertyFilter, setPropertyFilter] = useState<PropertyFilter>(propertyId ?? "all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  useEffect(() => {
    setSubmitted(loadSubmissions().map(submissionApplicant));
  }, []);

  const applications = useMemo(
    () => sortDeskFirst([...submitted, ...getAllApplications()]),
    [submitted]
  );

  const scoped = applications.filter((row) => {
    const listing = propertyId ?? (propertyFilter === "all" ? undefined : propertyFilter);
    if (listing && row.propertyId !== listing) return false;
    if (statusFilter === "all") return true;
    if (statusFilter === "received") {
      return row.status === "completed" || row.status === "approved" || row.status === "declined";
    }
    return row.status === statusFilter;
  });

  return (
    <>
      {chrome ? (
      <DeskToolbar meta={`${scoped.length} in queue`}>
        <DeskPill
          active={propertyFilter === "all" && !propertyId}
          onClick={() => {
            setPropertyFilter("all");
            setStatusFilter("all");
          }}
        >
          All properties
        </DeskPill>
        <DeskPill
          active={statusFilter === "received"}
          onClick={() => setStatusFilter(statusFilter === "received" ? "all" : "received")}
        >
          Received
        </DeskPill>
      </DeskToolbar>
      ) : null}
      <ApplicationTable
        rows={scoped}
        showExtras={extras}
        packetLinks
        selectedId={scoped[0]?.id}
      />
    </>
  );
}
