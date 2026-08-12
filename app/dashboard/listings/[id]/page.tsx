import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Copy, 
  ExternalLink, 
  Edit,
  Home,
  DollarSign,
  Calendar
} from "lucide-react";
import { 
  getPropertyById, 
  getApplicantsByProperty,
  getStatusColor,
  getStatusLabel 
} from "@/lib/data/mock-data";

export default async function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const property = getPropertyById(id);
  
  if (!property) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Property Not Found</h2>
        <Link href="/dashboard">
          <Button>Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  const applicants = getApplicantsByProperty(property.id);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      {/* Property Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{property.address}</h1>
          <div className="flex items-center gap-4 mt-2 text-gray-600">
            <span className="flex items-center gap-1">
              <Home className="w-4 h-4" />
              {property.bedrooms} bed · {property.bathrooms} bath
            </span>
            <span className="flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              ${property.rent.toLocaleString()}/mo
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              Available {new Date(property.availableDate).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {property.screeningPackage === "premium" ? "Premium Screening" : "Standard Screening"}
          </Badge>
          <Button variant="outline">
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>

      {/* Application Link */}
      <Card>
        <CardHeader>
          <CardTitle>Application Link</CardTitle>
          <CardDescription>Share this link with prospective tenants</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Input 
              value={`https://leaseflow.app/apply/${property.id}`} 
              readOnly 
              className="font-mono text-sm"
            />
            <Button>
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </Button>
            <Link href={`/apply/${property.id}`} target="_blank">
              <Button variant="outline">
                <ExternalLink className="w-4 h-4 mr-2" />
                Preview
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Applicants */}
      <div>
        <h2 className="text-xl font-semibold mb-4">
          Applicants ({applicants.length})
        </h2>

        {applicants.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="text-gray-400 mb-4">
                <Users className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No applicants yet</h3>
              <p className="text-gray-600 mb-4">
                Share your application link to start receiving applications
              </p>
              <Button>
                <Copy className="w-4 h-4 mr-2" />
                Copy Application Link
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {applicants.map((applicant) => (
              <Card key={applicant.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-gray-600">
                          {applicant.firstName[0]}{applicant.lastName[0]}
                        </span>
                      </div>
                      <div>
                        <div className="font-semibold text-lg">
                          {applicant.firstName} {applicant.lastName}
                        </div>
                        <div className="text-sm text-gray-600">
                          {applicant.email} · {applicant.phone}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Applied {new Date(applicant.appliedAt).toLocaleDateString()}
                          {applicant.completedAt && (
                            <> · Completed {new Date(applicant.completedAt).toLocaleDateString()}</>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {applicant.leaseScore && (
                        <div className="text-right mr-4">
                          <div className="text-2xl font-bold text-primary">
                            {applicant.leaseScore}
                          </div>
                          <div className="text-xs text-gray-500">LeaseScore</div>
                        </div>
                      )}
                      <Badge className={getStatusColor(applicant.status)}>
                        {getStatusLabel(applicant.status)}
                      </Badge>
                      {(applicant.status === "completed" || 
                        applicant.status === "approved" || 
                        applicant.status === "declined") && (
                        <Link href={`/dashboard/applicants/${applicant.id}`}>
                          <Button>
                            View Report
                            <ExternalLink className="w-3 h-3 ml-2" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Input({ value, readOnly, className }: { value: string; readOnly?: boolean; className?: string }) {
  return (
    <input
      value={value}
      readOnly={readOnly}
      className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ${className}`}
    />
  );
}

function Users({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
