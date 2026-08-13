import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Home,
  Users,
  FileCheck,
  Clock,
  ArrowRight,
} from "lucide-react";
import {
  mockProperties,
  mockApplicants,
  getAllApplications,
  getApplicantsByProperty,
  getPropertyById,
  getScoreColor,
  getStatusColor,
  getStatusLabel,
} from "@/lib/data/mock-data";

export default function DashboardPage() {
  const activeListings = mockProperties.length;
  const allApplicants = mockApplicants;
  const pendingApplications = allApplicants.filter(
    (a) => a.status === "in_progress" || a.status === "invited"
  ).length;
  const completedScreenings = allApplicants.filter(
    (a) => a.status === "completed" || a.status === "approved" || a.status === "declined"
  ).length;

  const recentApplications = getAllApplications().slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-ink">Dashboard</h1>
          <p className="text-mute mt-1">Review applications and keep your pipeline moving</p>
        </div>
        <Link href="/dashboard/applications">
          <Button size="lg">
            View Applications
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-mute">Total applications</CardTitle>
            <Users className="w-4 h-4 text-mute-3" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{allApplicants.length}</div>
            <p className="text-xs text-mute-2 mt-1">Across all properties</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-mute">
              Pending Applications
            </CardTitle>
            <Clock className="w-4 h-4 text-mute-3" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#8a6400]">{pendingApplications}</div>
            <p className="text-xs text-mute-2 mt-1">Waiting for completion</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-mute">
              Completed Screenings
            </CardTitle>
            <FileCheck className="w-4 h-4 text-mute-3" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-ok">{completedScreenings}</div>
            <p className="text-xs text-mute-2 mt-1">Ready to review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-mute">Active listings</CardTitle>
            <Home className="w-4 h-4 text-mute-3" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeListings}</div>
            <p className="text-xs text-mute-2 mt-1">Properties accepting applications</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Applications — the primary workflow */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recent applications</h2>
          <Link href="/dashboard/applications">
            <Button variant="outline" size="sm">
              View All
            </Button>
          </Link>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {recentApplications.map((applicant) => {
                const property = getPropertyById(applicant.propertyId);
                return (
                  <Link
                    key={applicant.id}
                    href={`/dashboard/applications/${applicant.id}`}
                    className="flex items-center justify-between gap-4 p-4 hover:bg-mist transition-colors"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-10 h-10 bg-line rounded-full flex items-center justify-center shrink-0">
                        <span className="text-sm font-semibold text-mute">
                          {applicant.firstName[0]}
                          {applicant.lastName[0]}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium">
                          {applicant.firstName} {applicant.lastName}
                        </div>
                        <div className="text-sm text-mute truncate">{property?.address}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      {applicant.leaseScore && (
                        <div className="text-right">
                          <div className={`font-semibold ${getScoreColor(applicant.leaseScore)}`}>
                            {applicant.leaseScore}
                          </div>
                          <div className="text-xs text-mute-2">LeaseScore</div>
                        </div>
                      )}
                      <Badge className={getStatusColor(applicant.status)}>
                        {getStatusLabel(applicant.status)}
                      </Badge>
                      <ArrowRight className="w-4 h-4 text-mute-3" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Properties — secondary */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-ink-2">Properties</h2>
          <div className="flex items-center gap-2">
            <Link href="/dashboard/listings/new">
              <Button variant="ghost" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Create Listing
              </Button>
            </Link>
            <Link href="/dashboard/listings">
              <Button variant="outline" size="sm">
                Manage
              </Button>
            </Link>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {mockProperties.map((property) => {
                const applicants = getApplicantsByProperty(property.id);
                return (
                  <Link
                    key={property.id}
                    href={`/dashboard/listings/${property.id}`}
                    className="flex items-center justify-between gap-4 p-4 hover:bg-mist transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="font-medium truncate">{property.address}</div>
                      <div className="text-sm text-mute">
                        {property.bedrooms} bed · {property.bathrooms} bath · $
                        {property.rent.toLocaleString()}/mo
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0 text-sm text-mute">
                      <span>
                        {applicants.length} application{applicants.length === 1 ? "" : "s"}
                      </span>
                      <Badge variant="secondary">
                        {property.screeningPackage === "premium" ? "Premium" : "Standard"}
                      </Badge>
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
