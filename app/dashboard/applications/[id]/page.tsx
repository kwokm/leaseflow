"use client";

import { use, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  AlertTriangle,
  Briefcase,
  Car,
  CheckCircle,
  Clock,
  Download,
  FileText,
  Home,
  PawPrint,
  Printer,
  Scale,
  Shield,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";
import {
  getApplicantById,
  getApplicationDetails,
  getPaymentsByApplicant,
  getPropertyById,
  getReportByApplicant,
  getScoreColor,
  getScoreLabel,
  getStatusColor,
  getStatusLabel,
} from "@/lib/data/mock-data";
import { downloadPacket } from "@/lib/packet-document";

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-sm text-gray-600">{label}</div>
      <div className="font-medium text-gray-900 mt-0.5">{value}</div>
    </div>
  );
}

function SectionHeading({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
      <Icon className="w-5 h-5" />
      {children}
    </h2>
  );
}

export default function ApplicationPacketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [adverseActionOpen, setAdverseActionOpen] = useState(false);

  const applicant = getApplicantById(id);
  const property = applicant ? getPropertyById(applicant.propertyId) : undefined;
  const report = applicant ? getReportByApplicant(applicant.id) : undefined;
  const details = applicant ? getApplicationDetails(applicant.id) : undefined;
  const payments = applicant ? getPaymentsByApplicant(applicant.id) : [];

  if (!applicant || !property) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Application Not Found</h2>
        <Link href="/dashboard/applications">
          <Button>Back to Applications</Button>
        </Link>
      </div>
    );
  }

  const fullName = `${applicant.firstName} ${applicant.lastName}`;
  const decided = applicant.status === "approved" || applicant.status === "declined";

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="print:hidden">
        <Link href="/dashboard/applications">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Applications
          </Button>
        </Link>
      </div>

      {/* Print-only document header */}
      <div className="hidden print:block border-b-2 border-primary pb-3 mb-4">
        <div className="text-2xl font-bold">Application Packet — {fullName}</div>
        <div className="text-sm text-gray-600">{property.address}</div>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">{fullName}</h1>
            <Badge className={getStatusColor(applicant.status)}>
              {getStatusLabel(applicant.status)}
            </Badge>
          </div>
          <p className="text-gray-600 mt-1">{property.address}</p>
          <div className="flex flex-wrap items-center gap-3 mt-3">
            <span className="text-sm text-gray-600">{applicant.email}</span>
            <span className="text-gray-400">·</span>
            <span className="text-sm text-gray-600">{applicant.phone}</span>
            <span className="text-gray-400">·</span>
            <span className="text-sm text-gray-600">
              Applied {new Date(applicant.appliedAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 print:hidden">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button
            variant="outline"
            onClick={() => downloadPacket({ applicant, property, details, report })}
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          {!decided && (
            <>
              <Button className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve
              </Button>
              <Button variant="destructive" onClick={() => setAdverseActionOpen(true)}>
                <XCircle className="w-4 h-4 mr-2" />
                Decline
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Demo Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 print:hidden">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <div className="font-semibold text-blue-900">Demo Data</div>
            <div className="text-sm text-blue-700">
              This packet contains mock data for demonstration purposes. No real credit bureau or
              background check services were used.
            </div>
          </div>
        </div>
      </div>

      {/* LeaseScore */}
      {report ? (
        <Card className="border-2 border-primary/20 print-avoid-break">
          <CardContent className="p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-sm font-medium text-gray-600 mb-2">LeaseScore™</div>
                <div className={`text-6xl font-bold ${getScoreColor(report.credit.leaseScore)}`}>
                  {report.credit.leaseScore}
                </div>
                <div className="text-lg text-gray-600 mt-2">
                  {getScoreLabel(report.credit.leaseScore)} Credit
                </div>
              </div>
              <div className="md:text-right">
                <div className="text-sm text-gray-600 mb-4">Score Range: 300-850</div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 md:justify-end">
                    <div className="w-3 h-3 rounded-full bg-green-600"></div>
                    <span className="text-sm">750+ Excellent</span>
                  </div>
                  <div className="flex items-center gap-2 md:justify-end">
                    <div className="w-3 h-3 rounded-full bg-yellow-600"></div>
                    <span className="text-sm">650-749 Good</span>
                  </div>
                  <div className="flex items-center gap-2 md:justify-end">
                    <div className="w-3 h-3 rounded-full bg-red-600"></div>
                    <span className="text-sm">&lt;650 Fair</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed print-avoid-break">
          <CardContent className="p-8 flex items-start gap-4">
            <Clock className="w-6 h-6 text-gray-400 mt-1" />
            <div>
              <div className="text-lg font-semibold">LeaseScore™ pending</div>
              <p className="text-gray-600 text-sm mt-1">
                {applicant.status === "invited"
                  ? "This applicant has been invited but has not started their application yet."
                  : "Screening runs once the applicant completes their application and pays the screening fee."}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Application Summary */}
      <div className="print-avoid-break">
        <SectionHeading icon={FileText}>Application Summary</SectionHeading>
        <Card>
          <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Field label="Property" value={property.address} />
            <Field label="Monthly rent" value={`$${property.rent.toLocaleString()}`} />
            <Field
              label="Screening package"
              value={property.screeningPackage === "premium" ? "Premium" : "Standard"}
            />
            <Field
              label="Applied"
              value={new Date(applicant.appliedAt).toLocaleDateString()}
            />
            <Field
              label="Completed"
              value={
                applicant.completedAt
                  ? new Date(applicant.completedAt).toLocaleDateString()
                  : "Not completed"
              }
            />
            <Field
              label="Desired move-in"
              value={
                details ? new Date(details.desiredMoveIn).toLocaleDateString() : "Not provided"
              }
            />
            <Field
              label="Screening fee"
              value={
                payments.length ? (
                  <span className="capitalize">
                    ${payments[0].amount.toFixed(2)} · {payments[0].status}
                  </span>
                ) : (
                  "No payment on file"
                )
              }
            />
            <Field
              label="Date of birth"
              value={
                details ? new Date(details.dateOfBirth).toLocaleDateString() : "Not provided"
              }
            />
            <Field label="SSN" value={details ? `•••-••-${details.ssnLast4}` : "Not provided"} />
          </CardContent>
        </Card>
      </div>

      {details ? (
        <>
          {/* Current Residence */}
          <div className="print-avoid-break">
            <SectionHeading icon={Home}>Current Residence</SectionHeading>
            <Card>
              <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label="Address" value={details.currentAddress.address} />
                <Field label="Resident since" value={details.currentAddress.since} />
                <Field
                  label="Monthly rent"
                  value={`$${details.currentAddress.monthlyRent.toLocaleString()}`}
                />
                <Field
                  label="Landlord"
                  value={`${details.currentAddress.landlordName} · ${details.currentAddress.landlordPhone}`}
                />
                <Field
                  label="Reason for leaving"
                  value={details.currentAddress.reasonForLeaving}
                />
              </CardContent>
            </Card>
          </div>

          {/* Employment (self-reported) */}
          <div className="print-avoid-break">
            <SectionHeading icon={Briefcase}>Employment (self-reported)</SectionHeading>
            <Card>
              <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label="Employer" value={details.employment.employer} />
                <Field label="Position" value={details.employment.position} />
                <Field label="Start date" value={details.employment.startDate} />
                <Field
                  label="Supervisor"
                  value={`${details.employment.supervisor} · ${details.employment.supervisorPhone}`}
                />
                <Field
                  label="Stated monthly income"
                  value={`$${details.employment.monthlyIncome.toLocaleString()}`}
                />
              </CardContent>
            </Card>
          </div>

          {/* Household */}
          <div className="print-avoid-break">
            <SectionHeading icon={Users}>Household</SectionHeading>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Occupants</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {details.occupants.map((occupant) => (
                    <div key={occupant.name}>
                      <div className="font-medium">{occupant.name}</div>
                      <div className="text-gray-600">
                        {occupant.relationship} · {occupant.age}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <PawPrint className="w-4 h-4" />
                    Pets
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {details.pets.length === 0 ? (
                    <span className="text-gray-500">None</span>
                  ) : (
                    details.pets.map((pet) => (
                      <div key={`${pet.type}-${pet.breed}`}>
                        <div className="font-medium">{pet.type}</div>
                        <div className="text-gray-600">
                          {pet.breed} · {pet.weight}
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <Car className="w-4 h-4" />
                    Vehicles
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {details.vehicles.length === 0 ? (
                    <span className="text-gray-500">None</span>
                  ) : (
                    details.vehicles.map((vehicle) => (
                      <div key={vehicle.plate}>
                        <div className="font-medium">
                          {vehicle.year} {vehicle.make} {vehicle.model}
                        </div>
                        <div className="text-gray-600">{vehicle.plate}</div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Disclosures & Documents */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print-avoid-break">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Disclosures</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Smoker</span>
                  <span className="font-medium">{details.disclosures.smoker ? "Yes" : "No"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Prior eviction</span>
                  <span className="font-medium">
                    {details.disclosures.priorEviction ? "Yes" : "No"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Bankruptcy</span>
                  <span className="font-medium">
                    {details.disclosures.bankruptcy ? "Yes" : "No"}
                  </span>
                </div>
                {details.disclosures.notes && (
                  <p className="text-gray-600 pt-2 border-t">{details.disclosures.notes}</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Documents</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {details.documents.length === 0 ? (
                  <span className="text-gray-500">No documents uploaded</span>
                ) : (
                  details.documents.map((doc) => (
                    <div key={doc.name} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="w-4 h-4 text-gray-400 shrink-0" />
                        <span className="truncate">{doc.name}</span>
                      </div>
                      <span className="text-gray-500 shrink-0">{doc.kind}</span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <Card className="print-avoid-break">
          <CardContent className="p-8 text-center text-gray-600">
            This applicant has been invited but has not submitted an application yet.
          </CardContent>
        </Card>
      )}

      {report && (
        <>
          {/* Credit Summary */}
          <div className="print-avoid-break">
            <SectionHeading icon={TrendingUp}>Credit Summary</SectionHeading>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { label: "Payment history", value: `${report.credit.paymentHistory}%` },
                { label: "Utilization", value: `${report.credit.creditUtilization}%` },
                { label: "Accounts", value: report.credit.totalAccounts },
                { label: "Derogatory marks", value: report.credit.derogatoryMarks },
                { label: "Hard inquiries", value: report.credit.hardInquiries },
              ].map((stat) => (
                <Card key={stat.label}>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-xs text-gray-600 mt-1">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Background Check */}
          <div className="print-avoid-break">
            <SectionHeading icon={Shield}>Background Check</SectionHeading>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: "Criminal", value: report.background.criminal },
                { label: "Eviction", value: report.background.eviction },
                { label: "Sex offender", value: report.background.sexOffender },
              ].map((check) => {
                const clear = check.value === "clear";
                return (
                  <Card
                    key={check.label}
                    className={clear ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}
                  >
                    <CardContent className="p-4 flex items-center gap-2">
                      {clear ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                      <span className="font-medium">
                        {check.label}: {clear ? "Clear" : "Records found"}
                      </span>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {report.background.details && (
              <Card className="mt-4 border-red-200">
                <CardHeader className="pb-3">
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
          <div className="print-avoid-break">
            <SectionHeading icon={Briefcase}>Income &amp; Employment (verified)</SectionHeading>
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Field label="Employer" value={report.income.employer} />
                  <Field label="Position" value={report.income.position} />
                  <Field
                    label="Monthly income"
                    value={
                      <span className="text-green-600">
                        ${report.income.monthlyIncome.toLocaleString()}
                      </span>
                    }
                  />
                  <Field
                    label="Verification status"
                    value={
                      report.income.verified ? (
                        <span className="text-green-600">Verified</span>
                      ) : (
                        <span className="text-red-600">Not verified</span>
                      )
                    }
                  />
                </div>

                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium mb-1">Rent-to-Income Ratio</div>
                  <div className="text-3xl font-bold text-primary">
                    {Math.round((property.rent / report.income.monthlyIncome) * 100)}%
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {property.rent / report.income.monthlyIncome <= 0.3
                      ? "Within recommended 30% guideline"
                      : "Above recommended 30% guideline"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Residential History */}
          <div className="print-avoid-break">
            <SectionHeading icon={Home}>Residential History (verified)</SectionHeading>
            <div className="space-y-3">
              {report.residentialHistory.map((residence) => (
                <Card key={residence.address}>
                  <CardContent className="p-6 flex items-start justify-between gap-4">
                    <div>
                      <div className="font-semibold">{residence.address}</div>
                      <div className="text-sm text-gray-600 mt-1">
                        {residence.from} - {residence.to}
                      </div>
                    </div>
                    {residence.landlordVerified ? (
                      <Badge className="bg-green-100 text-green-700">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Not Verified</Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Consent */}
      {details && (
        <div className="print-avoid-break">
          <SectionHeading icon={Scale}>Consent &amp; Authorization</SectionHeading>
          <Card>
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <Field label="Electronic signature" value={details.consent.signature} />
              <Field
                label="FCRA consent accepted"
                value={new Date(details.consent.acceptedAt).toLocaleString()}
              />
              <Field label="IP address" value={details.consent.ipAddress} />
            </CardContent>
          </Card>
        </div>
      )}

      <p className="text-xs text-gray-500 hidden print:block pt-4 border-t">
        Generated by LeaseFlow (demo prototype). Screening data is fictional — no consumer
        reporting agency was used.
      </p>

      {/* Adverse Action Dialog */}
      <Dialog open={adverseActionOpen} onOpenChange={setAdverseActionOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Scale className="w-5 h-5" />
              Adverse Action Notice Preview
            </DialogTitle>
            <DialogDescription>
              If you decline this application, the applicant will receive this notice per FCRA
              requirements.
            </DialogDescription>
          </DialogHeader>
          <div className="border rounded-lg p-6 bg-gray-50 text-sm space-y-4">
            <div>
              <strong>NOTICE OF ADVERSE ACTION</strong>
            </div>
            <div>Dear {fullName},</div>
            <div>
              Your application for the property at {property.address} has been declined based in
              whole or in part on information obtained in your consumer report.
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
              You have the right to obtain a free copy of your consumer report from the agency
              within 60 days. You also have the right to dispute the accuracy or completeness of
              any information in your report.
            </div>
            <div className="text-xs text-gray-600">
              This is a demo notice for prototype purposes only.
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdverseActionOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive">Send Notice &amp; Decline</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
