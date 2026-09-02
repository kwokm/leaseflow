"use client";

import { useMemo, useState } from "react";
import {
  getAllApplications,
  type Applicant,
  type ApplicationStatus,
} from "@/lib/data/mock-data";
import { useDeskApplicants } from "@/lib/desk/use-desk-applicants";
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
  preview = false,
}: {
  propertyId?: string;
  extras?: boolean;
  chrome?: boolean;
  selectedId?: string;
  preview?: boolean;
}) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  // `preview` is the marketing screenshot on the landing page, which is always
  // the seeded catalogue; the real desk reads the queue from Neon.
  const { applicants } = useDeskApplicants();
  const rows: Applicant[] = preview ? getAllApplications() : applicants;

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
        packetLinks={!preview}
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
