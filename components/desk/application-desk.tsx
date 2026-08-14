"use client";

import { useEffect, useMemo, useState } from "react";
import type { Applicant, ApplicationStatus } from "@/lib/data/mock-data";
import { loadDeskApplicants } from "@/lib/desk/queue";
import { ApplicationTable } from "@/components/desk/application-table";
import { DeskPill, DeskToolbar } from "@/components/desk/packet-window";
import { ScreeningDemo } from "@/components/demos/screening";
import { Reveal } from "@/components/motion/reveal";

type StatusFilter = "all" | "received" | ApplicationStatus;

export function ApplicationDesk({
  propertyId,
  extras = true,
  chrome = true,
  selectedId,
}: {
  propertyId?: string;
  extras?: boolean;
  chrome?: boolean;
  selectedId?: string;
}) {
  const [rows, setRows] = useState<Applicant[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  useEffect(() => {
    setRows(loadDeskApplicants());
  }, []);

  const scoped = useMemo(() => {
    return rows.filter((row) => {
      if (propertyId && row.propertyId !== propertyId) return false;
      if (statusFilter === "all") return true;
      if (statusFilter === "received") {
        return row.status === "completed" || row.status === "approved" || row.status === "declined";
      }
      return row.status === statusFilter;
    });
  }, [rows, propertyId, statusFilter]);

  return (
    <Reveal>
      {chrome ? (
        <DeskToolbar meta={`${scoped.length} in queue`}>
          <DeskPill
            active={statusFilter === "all"}
            onClick={() => setStatusFilter("all")}
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
      {chrome ? (
        <div className="border-b border-line">
          <ScreeningDemo />
        </div>
      ) : null}
      <ApplicationTable
        rows={scoped}
        showExtras={extras}
        packetLinks
        selectedId={selectedId ?? scoped[0]?.id}
        empty={
          propertyId
            ? "No applicants on this listing yet."
            : "No applications in this queue."
        }
      />
    </Reveal>
  );
}
