"use client";

import { useEffect, useMemo, useState } from "react";
import type { Applicant, ApplicationStatus } from "@/lib/data/mock-data";
import { getAllApplications, getPropertyById, mockProperties } from "@/lib/data/mock-data";
import { loadSubmissions } from "@/lib/apply/storage";
import { submissionApplicant } from "@/lib/apply/to-packet";
import { shortAddress, sortDeskFirst } from "@/lib/desk/display";
import { ApplicationTable } from "@/components/desk/application-table";
import { DeskPill, DeskToolbar } from "@/components/desk/packet-window";

type PropertyFilter = "all" | string;
type StatusFilter = "all" | "received" | ApplicationStatus;

export function ApplicationDesk({
  propertyId,
  extras = true,
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
        {!propertyId && (
          <>
            <DeskPill active={propertyFilter === "all"} onClick={() => setPropertyFilter("all")}>
              All properties
            </DeskPill>
            {mockProperties.map((property) => (
              <DeskPill
                key={property.id}
                active={propertyFilter === property.id}
                onClick={() => setPropertyFilter(property.id)}
              >
                {shortAddress(property.address)}
              </DeskPill>
            ))}
          </>
        )}
        {propertyId && (
          <DeskPill active>
            {shortAddress(getPropertyById(propertyId)?.address ?? "Listing")}
          </DeskPill>
        )}
        <DeskPill active={statusFilter === "all"} onClick={() => setStatusFilter("all")}>
          All
        </DeskPill>
        <DeskPill
          active={statusFilter === "received"}
          onClick={() => setStatusFilter("received")}
        >
          Received
        </DeskPill>
      </DeskToolbar>
      ) : null}
      <ApplicationTable
        rows={scoped}
        showExtras={extras}
        packetLinks
      />
    </>
  );
}
