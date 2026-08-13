"use client";

import { useRouter } from "next/navigation";
import type { Applicant } from "@/lib/data/mock-data";
import { getPropertyById } from "@/lib/data/mock-data";
import { creditScore, incomeMultiple, shortAddress } from "@/lib/desk/display";
import { Avatar } from "@/components/desk/avatar";
import { StatusPill } from "@/components/desk/status-pill";
import { cn } from "@/lib/utils";

function Row({
  href,
  selected,
  children,
  label,
}: {
  href?: string;
  selected?: boolean;
  children: React.ReactNode;
  label: string;
}) {
  const router = useRouter();

  return (
    <tr
      className={cn(selected && "is-selected", href && "cursor-pointer")}
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

export function ApplicationTable({
  rows,
  hrefFor,
  selectedId,
  showExtras = false,
  empty = "No applications in this queue.",
}: {
  rows: Applicant[];
  hrefFor?: (row: Applicant) => string;
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

  return (
    <div className="overflow-x-auto">
      <table className="app-table">
        <thead>
          <tr>
            <th>Applicant</th>
            <th>Property</th>
            <th className="num">LeaseScore</th>
            {showExtras ? <th className="num">Credit</th> : null}
            {showExtras ? <th className="num">Income</th> : null}
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const property = getPropertyById(row.propertyId);
            const href = hrefFor?.(row);
            const multiple = incomeMultiple(row);
            const credit = creditScore(row);
            const name = `${row.firstName} ${row.lastName}`;

            return (
              <Row
                key={row.id}
                href={href}
                selected={selectedId === row.id}
                label={`Open packet for ${name}`}
              >
                <td>
                  <span className="who">
                    <Avatar firstName={row.firstName} lastName={row.lastName} />
                    {name}
                  </span>
                </td>
                <td>{property ? shortAddress(property.address) : "—"}</td>
                <td className="num score">{row.leaseScore ?? "—"}</td>
                {showExtras ? <td className="num">{credit ?? "—"}</td> : null}
                {showExtras ? (
                  <td className="num">{multiple ? `${multiple.toFixed(1)}×` : "—"}</td>
                ) : null}
                <td>
                  <StatusPill status={row.status} />
                </td>
              </Row>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
