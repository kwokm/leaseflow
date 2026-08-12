import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Home, 
  Users, 
  FileCheck, 
  TrendingUp,
  Copy,
  ExternalLink,
  Clock
} from "lucide-react";
import { 
  mockProperties, 
  mockApplicants, 
  getApplicantsByProperty,
  getStatusColor,
  getStatusLabel 
} from "@/lib/data/mock-data";

export default function DashboardPage() {
  // Calculate stats
  const activeListings = mockProperties.length;
  const allApplicants = mockApplicants;
  const pendingApplications = allApplicants.filter(a => 
    a.status === "in_progress" || a.status === "invited"
  ).length;
  const completedScreenings = allApplicants.filter(a => 
    a.status === "completed" || a.status === "approved" || a.status === "declined"
  ).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage your properties and tenant applications</p>
        </div>
        <Link href="/dashboard/listings/new">
          <Button size="lg">
            <Plus className="w-4 h-4 mr-2" />
            Create Listing
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Active Listings
            </CardTitle>
            <Home className="w-4 h-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeListings}</div>
            <p className="text-xs text-gray-500 mt-1">Properties accepting applications</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Pending Applications
            </CardTitle>
            <Clock className="w-4 h-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{pendingApplications}</div>
            <p className="text-xs text-gray-500 mt-1">Waiting for completion</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Completed Screenings
            </CardTitle>
            <FileCheck className="w-4 h-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{completedScreenings}</div>
            <p className="text-xs text-gray-500 mt-1">Ready to review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Applicants
            </CardTitle>
            <Users className="w-4 h-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{allApplicants.length}</div>
            <p className="text-xs text-gray-500 mt-1">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Properties List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Properties</h2>
          <Link href="/dashboard/listings">
            <Button variant="outline" size="sm">
              View All
            </Button>
          </Link>
        </div>

        <div className="space-y-4">
          {mockProperties.map((property) => {
            const applicants = getApplicantsByProperty(property.id);
            const statusCounts = {
              invited: applicants.filter(a => a.status === "invited").length,
              in_progress: applicants.filter(a => a.status === "in_progress").length,
              completed: applicants.filter(a => a.status === "completed").length,
              approved: applicants.filter(a => a.status === "approved").length,
              declined: applicants.filter(a => a.status === "declined").length,
            };

            return (
              <Card key={property.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{property.address}</CardTitle>
                      <CardDescription className="mt-2 flex items-center gap-4">
                        <span>{property.bedrooms} bed · {property.bathrooms} bath</span>
                        <span>·</span>
                        <span className="font-semibold text-gray-900">
                          ${property.rent.toLocaleString()}/mo
                        </span>
                        <span>·</span>
                        <span>Available {new Date(property.availableDate).toLocaleDateString()}</span>
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="ml-4">
                      {property.screeningPackage === "premium" ? "Premium" : "Standard"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6 text-sm">
                      <div>
                        <span className="text-gray-600">Applicants: </span>
                        <span className="font-semibold">{applicants.length}</span>
                      </div>
                      {statusCounts.in_progress > 0 && (
                        <Badge className={getStatusColor("in_progress")}>
                          {statusCounts.in_progress} In Progress
                        </Badge>
                      )}
                      {statusCounts.completed > 0 && (
                        <Badge className={getStatusColor("completed")}>
                          {statusCounts.completed} Completed
                        </Badge>
                      )}
                      {statusCounts.approved > 0 && (
                        <Badge className={getStatusColor("approved")}>
                          {statusCounts.approved} Approved
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Link
                      </Button>
                      <Link href={`/dashboard/listings/${property.id}`}>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recent Applicants */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recent Applicants</h2>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {mockApplicants.slice(0, 6).map((applicant) => {
                const property = mockProperties.find(p => p.id === applicant.propertyId);
                return (
                  <div key={applicant.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-sm font-semibold text-gray-600">
                            {applicant.firstName[0]}{applicant.lastName[0]}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium">
                            {applicant.firstName} {applicant.lastName}
                          </div>
                          <div className="text-sm text-gray-600">
                            {property?.address}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge className={getStatusColor(applicant.status)}>
                          {getStatusLabel(applicant.status)}
                        </Badge>
                        {(applicant.status === "completed" || applicant.status === "approved" || applicant.status === "declined") && (
                          <Link href={`/dashboard/applicants/${applicant.id}`}>
                            <Button size="sm">
                              View Report
                              <ExternalLink className="w-3 h-3 ml-2" />
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
