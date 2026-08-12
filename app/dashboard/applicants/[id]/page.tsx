"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  FileText,
  TrendingUp,
  Home,
  Briefcase,
  Shield,
  Scale
} from "lucide-react";
import { 
  getApplicantById, 
  getPropertyById,
  getReportByApplicant,
  getStatusLabel 
} from "@/lib/data/mock-data";

export default function ApplicantReportPage({ params }: { params: { id: string } }) {
  const applicant = getApplicantById(params.id);
  const property = applicant ? getPropertyById(applicant.propertyId) : null;
  const report = applicant ? getReportByApplicant(applicant.id) : null;
  const [adverseActionOpen, setAdverseActionOpen] = useState(false);

  if (!applicant || !property) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Applicant Not Found</h2>
        <Link href="/dashboard">
          <Button>Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Report Not Available</h2>
        <p className="text-gray-600 mb-4">
          The screening report for this applicant is not yet available.
        </p>
        <Link href="/dashboard">
          <Button>Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 750) return "text-green-600";
    if (score >= 650) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 750) return "Excellent";
    if (score >= 650) return "Good";
    return "Fair";
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <Link href={`/dashboard/listings/${property.id}`}>
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Property
          </Button>
        </Link>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {applicant.firstName} {applicant.lastName}
          </h1>
          <p className="text-gray-600 mt-1">{property.address}</p>
          <div className="flex items-center gap-3 mt-3">
            <span className="text-sm text-gray-600">{applicant.email}</span>
            <span className="text-gray-400">·</span>
            <span className="text-sm text-gray-600">{applicant.phone}</span>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Button className="bg-green-600 hover:bg-green-700">
            <CheckCircle className="w-4 h-4 mr-2" />
            Approve
          </Button>
          <Button 
            variant="destructive"
            onClick={() => setAdverseActionOpen(true)}
          >
            <XCircle className="w-4 h-4 mr-2" />
            Decline
          </Button>
          <Button variant="outline">
            Request More Info
          </Button>
        </div>
      </div>

      {/* Demo Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <div className="font-semibold text-blue-900">Demo Data</div>
            <div className="text-sm text-blue-700">
              This is a sample screening report with mock data for demonstration purposes.
              No real credit bureau or background check services were used.
            </div>
          </div>
        </div>
      </div>

      {/* LeaseScore */}
      <Card className="border-2 border-primary/20">
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-600 mb-2">LeaseScore™</div>
              <div className={`text-6xl font-bold ${getScoreColor(report.credit.leaseScore)}`}>
                {report.credit.leaseScore}
              </div>
              <div className="text-lg text-gray-600 mt-2">
                {getScoreLabel(report.credit.leaseScore)} Credit
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600 mb-4">Score Range: 300-850</div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-600"></div>
                  <span className="text-sm">750+ Excellent</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-600"></div>
                  <span className="text-sm">650-749 Good</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-600"></div>
                  <span className="text-sm">&lt;650 Fair</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Credit Summary */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Credit Summary
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Payment History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{report.credit.paymentHistory}%</div>
              <p className="text-sm text-gray-600 mt-1">On-time payments</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Credit Utilization
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{report.credit.creditUtilization}%</div>
              <p className="text-sm text-gray-600 mt-1">Of available credit</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Accounts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{report.credit.totalAccounts}</div>
              <p className="text-sm text-gray-600 mt-1">Credit accounts</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Derogatory Marks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className={`text-3xl font-bold ${report.credit.derogatoryMarks === 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {report.credit.derogatoryMarks}
                </div>
                {report.credit.derogatoryMarks === 0 && (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                )}
              </div>
              <p className="text-sm text-gray-600 mt-1">Collections, bankruptcies, etc.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Hard Inquiries
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{report.credit.hardInquiries}</div>
              <p className="text-sm text-gray-600 mt-1">In the past 12 months</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Background Check */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Background Check
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className={report.background.criminal === "clear" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                {report.background.criminal === "clear" ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span>Criminal: Clear</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-red-600" />
                    <span>Criminal: Records Found</span>
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                {report.background.criminal === "clear" 
                  ? "No criminal records found" 
                  : "See details below"}
              </p>
            </CardContent>
          </Card>

          <Card className={report.background.eviction === "clear" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                {report.background.eviction === "clear" ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span>Eviction: Clear</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-red-600" />
                    <span>Eviction: Records Found</span>
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                {report.background.eviction === "clear" 
                  ? "No eviction records found" 
                  : "See details below"}
              </p>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>Sex Offender: Clear</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Not found on registry
              </p>
            </CardContent>
          </Card>
        </div>

        {report.background.details && (
          <Card className="mt-4 border-red-200">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                Additional Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{report.background.details}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Income Verification */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Briefcase className="w-5 h-5" />
          Income & Employment
        </h2>
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="text-sm text-gray-600 mb-1">Employer</div>
                <div className="font-semibold text-lg">{report.income.employer}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Position</div>
                <div className="font-semibold text-lg">{report.income.position}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Monthly Income</div>
                <div className="font-semibold text-lg text-green-600">
                  ${report.income.monthlyIncome.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Verification Status</div>
                <div className="flex items-center gap-2">
                  {report.income.verified ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-semibold text-green-600">Verified</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-red-600" />
                      <span className="font-semibold text-red-600">Not Verified</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium mb-2">Rent-to-Income Ratio</div>
              <div className="text-3xl font-bold text-primary">
                {Math.round((property.rent / report.income.monthlyIncome) * 100)}%
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {(property.rent / report.income.monthlyIncome) <= 0.30 
                  ? "Within recommended 30% guideline" 
                  : "Above recommended 30% guideline"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Residential History */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Home className="w-5 h-5" />
          Residential History
        </h2>
        <div className="space-y-3">
          {report.residentialHistory.map((residence, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold text-lg">{residence.address}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      {residence.from} - {residence.to}
                    </div>
                  </div>
                  <div>
                    {residence.landlordVerified ? (
                      <Badge className="bg-green-100 text-green-700">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        Not Verified
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Adverse Action Dialog */}
      <Dialog open={adverseActionOpen} onOpenChange={setAdverseActionOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Scale className="w-5 h-5" />
              Adverse Action Notice Preview
            </DialogTitle>
            <DialogDescription>
              If you decline this application, the applicant will receive this notice per FCRA requirements.
            </DialogDescription>
          </DialogHeader>
          <div className="border rounded-lg p-6 bg-gray-50 text-sm space-y-4">
            <div>
              <strong>NOTICE OF ADVERSE ACTION</strong>
            </div>
            <div>
              Dear {applicant.firstName} {applicant.lastName},
            </div>
            <div>
              Your application for the property at {property.address} has been declined based in whole or in part on information obtained in your consumer report.
            </div>
            <div>
              <strong>Consumer Reporting Agency:</strong>
              <br />
              LeaseFlow Screening Services (Demo)
              <br />
              (555) 123-4567
              <br />
              support@leaseflow.app
            </div>
            <div>
              You have the right to obtain a free copy of your consumer report from the agency within 60 days. You also have the right to dispute the accuracy or completeness of any information in your report.
            </div>
            <div className="text-xs text-gray-600">
              This is a demo notice for prototype purposes only.
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdverseActionOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive">
              Send Notice & Decline
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
