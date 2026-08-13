import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Copy, ExternalLink } from "lucide-react";
import { mockProperties, getApplicantsByProperty } from "@/lib/data/mock-data";

export default function ListingsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-ink">Properties</h1>
          <p className="text-mute mt-1">Manage your rental listings</p>
        </div>
        <Link href="/dashboard/listings/new">
          <Button size="lg">
            <Plus className="w-4 h-4 mr-2" />
            Create Listing
          </Button>
        </Link>
      </div>

      {/* Properties Grid */}
      <div className="space-y-4">
        {mockProperties.map((property) => {
          const applicants = getApplicantsByProperty(property.id);
          const statusCounts = {
            total: applicants.length,
            pending: applicants.filter(a => a.status === "in_progress" || a.status === "invited").length,
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
                      <span className="font-semibold text-ink">
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
                      <span className="text-mute">Total applicants: </span>
                      <span className="font-semibold">{statusCounts.total}</span>
                    </div>
                    {statusCounts.pending > 0 && (
                      <div>
                        <span className="text-mute">Pending: </span>
                        <span className="font-semibold text-blue">{statusCounts.pending}</span>
                      </div>
                    )}
                    {statusCounts.completed > 0 && (
                      <div>
                        <span className="text-mute">Completed: </span>
                        <span className="font-semibold text-ink-2">{statusCounts.completed}</span>
                      </div>
                    )}
                    {statusCounts.approved > 0 && (
                      <div>
                        <span className="text-mute">Approved: </span>
                        <span className="font-semibold text-ok">{statusCounts.approved}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Link
                    </Button>
                    <Link href={`/dashboard/listings/${property.id}`}>
                      <Button size="sm">
                        View Details
                        <ExternalLink className="w-3 h-3 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {mockProperties.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="text-mute-3 mb-4">
              <Plus className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No properties yet</h3>
            <p className="text-mute mb-4">
              Create your first listing to start receiving applications
            </p>
            <Link href="/dashboard/listings/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Listing
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
