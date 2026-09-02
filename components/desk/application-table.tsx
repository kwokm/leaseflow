"use client";

import { Fragment } from "react";
import { useRouter } from "next/navigation";
import type { Applicant } from "@/lib/data/mock-data";
import { getAiIncome, getPropertyById } from "@/lib/data/mock-data";
import { creditScore, incomeMultiple, shortAddress } from "@/lib/desk/display";
import { householdsFirst, householdTotals, fullName } from "@/lib/desk/household";
import { AiIncomeLine } from "@/components/desk/household-block";
import { Avatar } from "@/components/desk/avatar";
import { StatusPill } from "@/components/desk/status-pill";
import { cn } from "@/lib/utils";

function Row({
  href,
  selected,
  children,
  label,
  className,
}: {
  href?: string;
  selected?: boolean;
  children: React.ReactNode;
  label: string;
  className?: string;
}) {
  const router = useRouter();

  return (
    <tr
      className={cn(selected && "is-selected", href && "cursor-pointer", className)}
      onClick={href ? () => router.push(href) : undefined}
      onKeyDown={
        href
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                router.push(href);
              }
            }
          : undefined
      }
      tabIndex={href ? 0 : undefined}
      aria-label={href ? label : undefined}
    >
      {children}
    </tr>
  );
}

function ApplicantCells({
  row,
  showExtras,
  nested = false,
}: {
  row: Applicant;
  showExtras: boolean;
  nested?: boolean;
}) {
  const property = getPropertyById(row.propertyId);
  const multiple = incomeMultiple(row);
  const credit = creditScore(row);
  const name = fullName(row);
  const screen = getAiIncome(row.id);

  return (
    <>
      <td>
        <span className="who">
          <Avatar firstName={row.firstName} lastName={row.lastName} />
          <span>
            <span className="block">{name}</span>
            {nested ? (
              <span className="block text-[11px] font-medium text-mute">Co-tenant</span>
            ) : null}
          </span>
        </span>
      </td>
      <td>{property ? shortAddress(property.address) : "—"}</td>
      <td className="num score">{row.leaseScore ?? "—"}</td>
      {showExtras ? <td className="num">{credit ?? "—"}</td> : null}
      {showExtras ? (
        <td className="num">
          {screen ? (
            <span>
              <AiIncomeLine applicant={row} compact />
              {multiple ? (
                <span className="ml-1 text-[11px] font-medium text-mute">{multiple.toFixed(1)}×</span>
              ) : null}
            </span>
          ) : multiple ? (
            `${multiple.toFixed(1)}×`
          ) : (
            "—"
          )}
        </td>
      ) : null}
      <td>
        <StatusPill status={row.status} />
      </td>
    </>
  );
}

export function ApplicationTable({
  rows,
  packetLinks = false,
  selectedId,
  showExtras = false,
  empty = "No applications in this queue.",
}: {
  rows: Applicant[];
  /** Open `/dashboard/applications/[id]` when a row is activated. */
  packetLinks?: boolean;
  selectedId?: string;
  /** Owner desk: LeaseScore plus credit and income multiple. */
  showExtras?: boolean;
  empty?: string;
}) {
  if (rows.length === 0) {
    return (
      <p className="px-5 py-12 text-center text-[13px] font-medium text-mute">{empty}</p>
    );
  }

  const groups = householdsFirst(rows);
  return (
    <div className="overflow-x-auto">
      <table className="app-table">
        <thead>
          <tr>
            <th>Applicant</th>
            <th>Property</th>
            <th className="num">LeaseScore</th>
            {showExtras ? <th className="num">Credit</th> : null}
            {showExtras ? <th className="num">AI income</th> : null}
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {groups.map((group) => {
            if (group.kind === "solo") {
              const row = group.applicant;
              const href = packetLinks ? `/dashboard/applications/${row.id}` : undefined;
              return (
                <Row
                  key={row.id}
                  href={href}
                  selected={selectedId === row.id}
                  label={`Open packet for ${fullName(row)}`}
                >
                  <ApplicantCells row={row} showExtras={showExtras} />
                </Row>
              );
            }

            const totals = householdTotals(group.members);
            const property = getPropertyById(group.propertyId);
            const firstCompleted =
              group.members.find((row) => row.status === "completed" || row.status === "approved") ??
              group.members[0];
            const groupHref =
              packetLinks && firstCompleted
                ? `/dashboard/applications/${firstCompleted.id}`
                : undefined;

            return (
              <Fragment key={group.householdId}>
                <Row
                  href={groupHref}
                  selected={group.members.some((row) => row.id === selectedId)}
                  label={`Open household packet for ${totals.names}`}
                  className="is-household"
                >
                  <td>
                    <span className="who">
                      <span className="hh-pill">Household</span>
                      {totals.names}
                    </span>
                  </td>
                  <td>{property ? shortAddress(property.address) : "—"}</td>
                  <td className="num score">
                    {typeof totals.householdScore === "number" ? totals.householdScore : "—"}
                    <span className="ml-1 text-[11px] font-medium text-mute">Household</span>
                  </td>
                  {showExtras ? <td className="num">—</td> : null}
                  {showExtras ? (
                    <td className="num">
                      {totals.combinedGrossMonthly ? (
                        <span>
                          <span className="ai-income">
                            ${totals.combinedGrossMonthly.toLocaleString()} / mo
                          </span>
                          {totals.multiple ? (
                            <span className="ml-1 text-[11px] font-medium text-mute">
                              {totals.multiple.toFixed(1)}×
                            </span>
                          ) : null}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                  ) : null}
                  <td>
                    {totals.leadStatus ? <StatusPill status={totals.leadStatus} /> : "—"}
                  </td>
                </Row>
                {group.members.map((row) => {
                  const href = packetLinks ? `/dashboard/applications/${row.id}` : undefined;
                  return (
                    <Row
                      key={row.id}
                      href={href}
                      selected={selectedId === row.id}
                      label={`Open packet for ${fullName(row)}`}
                      className="is-member"
                    >
                      <ApplicantCells row={row} showExtras={showExtras} nested />
                    </Row>
                  );
                })}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
