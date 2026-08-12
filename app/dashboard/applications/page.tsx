"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, ClipboardList, ArrowRight } from "lucide-react";
import {
  getAllApplications,
  getPropertyById,
  getScoreColor,
  getStatusColor,
  getStatusLabel,
  type ApplicationStatus,
} from "@/lib/data/mock-data";

const filters: { value: ApplicationStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "invited", label: "Invited" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "approved", label: "Approved" },
  { value: "declined", label: "Declined" },
];

export default function ApplicationsPage() {
  const [status, setStatus] = useState<ApplicationStatus | "all">("all");
  const [query, setQuery] = useState("");

  const applications = useMemo(() => getAllApplications(), []);

  const rows = applications.filter((application) => {
    if (status !== "all" && application.status !== status) return false;
    if (!query.trim()) return true;

    const property = getPropertyById(application.propertyId);
    const haystack = [
      application.firstName,
      application.lastName,
      application.email,
      property?.address ?? "",
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(query.trim().toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Applications</h1>
        <p className="text-gray-600 mt-1">
          Every application across your properties, newest first
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => {
            const count =
              filter.value === "all"
                ? applications.length
                : applications.filter((a) => a.status === filter.value).length;

            return (
              <Button
                key={filter.value}
                size="sm"
                variant={status === filter.value ? "default" : "outline"}
                onClick={() => setStatus(filter.value)}
              >
                {filter.label}
                <span className="ml-2 text-xs opacity-70">{count}</span>
              </Button>
            );
          })}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search applicant or property"
            aria-label="Search applications"
            className="pl-9"
          />
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {rows.length === 0 ? (
            <div className="py-16 text-center">
              <ClipboardList className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold mb-1">No applications match</h3>
              <p className="text-gray-600 text-sm">
                Try a different status filter or clear your search.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                    <th scope="col" className="px-6 py-3 font-medium">
                      Applicant
                    </th>
                    <th scope="col" className="px-6 py-3 font-medium">
                      Property
                    </th>
                    <th scope="col" className="px-6 py-3 font-medium">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 font-medium">
                      LeaseScore
                    </th>
                    <th scope="col" className="px-6 py-3 font-medium">
                      Submitted
                    </th>
                    <th scope="col" className="px-6 py-3 font-medium text-right">
                      Packet
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {rows.map((application) => {
                    const property = getPropertyById(application.propertyId);

                    return (
                      <tr key={application.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center shrink-0">
                              <span className="text-xs font-semibold text-gray-600">
                                {application.firstName[0]}
                                {application.lastName[0]}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                {application.firstName} {application.lastName}
                              </div>
                              <div className="text-xs text-gray-500">{application.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {property ? (
                            <Link
                              href={`/dashboard/listings/${property.id}`}
                              className="hover:text-primary hover:underline"
                            >
                              {property.address}
                            </Link>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <Badge className={getStatusColor(application.status)}>
                            {getStatusLabel(application.status)}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          {application.leaseScore ? (
                            <span
                              className={`font-semibold ${getScoreColor(application.leaseScore)}`}
                            >
                              {application.leaseScore}
                            </span>
                          ) : (
                            <span className="text-gray-400">Pending</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {new Date(application.appliedAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link href={`/dashboard/applications/${application.id}`}>
                            <Button size="sm" variant="outline">
                              View
                              <ArrowRight className="w-3 h-3 ml-2" />
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
