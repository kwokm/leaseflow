"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, 
  Home, 
  User, 
  MapPin, 
  Briefcase, 
  Dog, 
  FileText,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  DollarSign
} from "lucide-react";
import { getPropertyById } from "@/lib/data/mock-data";

const STEPS = [
  { id: 1, name: "Start", icon: Home },
  { id: 2, name: "Personal Info", icon: User },
  { id: 3, name: "Residence", icon: MapPin },
  { id: 4, name: "Employment", icon: Briefcase },
  { id: 5, name: "Additional", icon: Dog },
  { id: 6, name: "Review", icon: FileText },
  { id: 7, name: "Complete", icon: CheckCircle },
];

export default function ApplyPage({ params }: { params: { listingId: string } }) {
  const router = useRouter();
  const property = getPropertyById(params.listingId);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Personal
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    ssn: "",
    // Current Residence
    currentAddress: "",
    currentCity: "",
    currentState: "",
    currentZip: "",
    moveInDate: "",
    moveOutDate: "",
    monthlyRent: "",
    landlordName: "",
    landlordPhone: "",
    // Employment
    employer: "",
    position: "",
    monthlyIncome: "",
    startDate: "",
    supervisorName: "",
    supervisorPhone: "",
    // Additional
    otherOccupants: "",
    pets: "",
    petDetails: "",
    vehicleCount: "",
  });

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Property Not Found</CardTitle>
            <CardDescription>This listing is no longer available.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const progress = (currentStep / STEPS.length) * 100;

  const nextStep = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    nextStep();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">LeaseFlow</span>
            </div>
            <div className="text-sm text-gray-600">
              Need help? <span className="text-primary font-medium cursor-pointer">Contact Support</span>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      {currentStep !== STEPS.length && (
        <div className="bg-white border-b py-4">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-medium text-gray-900">
                  Step {currentStep} of {STEPS.length - 1}
                </div>
                <div className="text-sm text-gray-600">
                  {STEPS[currentStep - 1].name}
                </div>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Step 1: Start */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <Card className="border-2">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Home className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-2xl mb-2">Apply for this Property</CardTitle>
                      <div className="text-base text-gray-700 font-medium">{property.address}</div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <span>{property.bedrooms} bed · {property.bathrooms} bath</span>
                        <span>·</span>
                        <span className="font-semibold text-gray-900">
                          ${property.rent.toLocaleString()}/mo
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="font-semibold text-blue-900 mb-2">What to Expect</div>
                    <ul className="text-sm text-blue-700 space-y-2">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>Complete your application in 15 minutes</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>Secure credit & background screening</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>Instant submission to landlord</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>One-time screening fee: ${property.screeningPackage === "premium" ? "59.99" : "39.99"}</span>
                      </li>
                    </ul>
                  </div>

                  <div className="text-xs text-gray-600 leading-relaxed">
                    By continuing, you authorize LeaseFlow to obtain your consumer report for rental screening purposes in accordance with the Fair Credit Reporting Act (FCRA). Your information is encrypted and secure.
                  </div>
                </CardContent>
              </Card>

              <Button onClick={nextStep} size="lg" className="w-full">
                Start Application
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {/* Step 2: Personal Info */}
          {currentStep === 2 && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>We need this information to verify your identity</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="(555) 123-4567"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ssn">Social Security Number *</Label>
                      <Input
                        id="ssn"
                        type="password"
                        placeholder="XXX-XX-XXXX"
                        value={formData.ssn}
                        onChange={(e) => setFormData({ ...formData, ssn: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={prevStep} className="flex-1">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button type="submit" className="flex-1">
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </form>
          )}

          {/* Step 3: Residential History */}
          {currentStep === 3 && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Current Residence</CardTitle>
                  <CardDescription>Tell us about where you currently live</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentAddress">Street Address *</Label>
                    <Input
                      id="currentAddress"
                      value={formData.currentAddress}
                      onChange={(e) => setFormData({ ...formData, currentAddress: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentCity">City *</Label>
                      <Input
                        id="currentCity"
                        value={formData.currentCity}
                        onChange={(e) => setFormData({ ...formData, currentCity: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currentState">State *</Label>
                      <Input
                        id="currentState"
                        maxLength={2}
                        placeholder="IL"
                        value={formData.currentState}
                        onChange={(e) => setFormData({ ...formData, currentState: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currentZip">ZIP Code *</Label>
                      <Input
                        id="currentZip"
                        value={formData.currentZip}
                        onChange={(e) => setFormData({ ...formData, currentZip: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="moveInDate">Move In Date *</Label>
                      <Input
                        id="moveInDate"
                        type="date"
                        value={formData.moveInDate}
                        onChange={(e) => setFormData({ ...formData, moveInDate: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="monthlyRent">Monthly Rent *</Label>
                      <Input
                        id="monthlyRent"
                        type="number"
                        placeholder="2000"
                        value={formData.monthlyRent}
                        onChange={(e) => setFormData({ ...formData, monthlyRent: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="font-medium mb-4">Landlord Information</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="landlordName">Landlord Name *</Label>
                        <Input
                          id="landlordName"
                          value={formData.landlordName}
                          onChange={(e) => setFormData({ ...formData, landlordName: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="landlordPhone">Landlord Phone *</Label>
                        <Input
                          id="landlordPhone"
                          type="tel"
                          value={formData.landlordPhone}
                          onChange={(e) => setFormData({ ...formData, landlordPhone: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={prevStep} className="flex-1">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button type="submit" className="flex-1">
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </form>
          )}

          {/* Step 4: Employment */}
          {currentStep === 4 && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Employment & Income</CardTitle>
                  <CardDescription>Current employment information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="employer">Employer Name *</Label>
                    <Input
                      id="employer"
                      value={formData.employer}
                      onChange={(e) => setFormData({ ...formData, employer: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="position">Position/Title *</Label>
                      <Input
                        id="position"
                        value={formData.position}
                        onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date *</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="monthlyIncome">Gross Monthly Income *</Label>
                    <Input
                      id="monthlyIncome"
                      type="number"
                      placeholder="5000"
                      value={formData.monthlyIncome}
                      onChange={(e) => setFormData({ ...formData, monthlyIncome: e.target.value })}
                      required
                    />
                    <p className="text-xs text-gray-600">Before taxes and deductions</p>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="font-medium mb-4">Supervisor Information</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="supervisorName">Supervisor Name *</Label>
                        <Input
                          id="supervisorName"
                          value={formData.supervisorName}
                          onChange={(e) => setFormData({ ...formData, supervisorName: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="supervisorPhone">Supervisor Phone *</Label>
                        <Input
                          id="supervisorPhone"
                          type="tel"
                          value={formData.supervisorPhone}
                          onChange={(e) => setFormData({ ...formData, supervisorPhone: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={prevStep} className="flex-1">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button type="submit" className="flex-1">
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </form>
          )}

          {/* Step 5: Additional Info */}
          {currentStep === 5 && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Additional Information</CardTitle>
                  <CardDescription>Tell us more about your household</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="otherOccupants">Other Occupants</Label>
                    <Input
                      id="otherOccupants"
                      type="number"
                      min="0"
                      placeholder="0"
                      value={formData.otherOccupants}
                      onChange={(e) => setFormData({ ...formData, otherOccupants: e.target.value })}
                    />
                    <p className="text-xs text-gray-600">
                      Number of additional adults or children who will live with you
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pets">Do you have pets?</Label>
                    <select
                      id="pets"
                      value={formData.pets}
                      onChange={(e) => setFormData({ ...formData, pets: e.target.value })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="">Select...</option>
                      <option value="no">No</option>
                      <option value="yes">Yes</option>
                    </select>
                  </div>

                  {formData.pets === "yes" && (
                    <div className="space-y-2">
                      <Label htmlFor="petDetails">Pet Details</Label>
                      <textarea
                        id="petDetails"
                        rows={3}
                        placeholder="Type, breed, weight, etc."
                        value={formData.petDetails}
                        onChange={(e) => setFormData({ ...formData, petDetails: e.target.value })}
                        className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="vehicleCount">Number of Vehicles</Label>
                    <Input
                      id="vehicleCount"
                      type="number"
                      min="0"
                      placeholder="1"
                      value={formData.vehicleCount}
                      onChange={(e) => setFormData({ ...formData, vehicleCount: e.target.value })}
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={prevStep} className="flex-1">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button type="submit" className="flex-1">
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </form>
          )}

          {/* Step 6: Review & Payment */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Review & Consent</CardTitle>
                  <CardDescription>Please review your information before submitting</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="font-semibold mb-2">Personal Information</div>
                    <div className="text-sm space-y-1 text-gray-600">
                      <div>{formData.firstName} {formData.lastName}</div>
                      <div>{formData.email} · {formData.phone}</div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="font-semibold mb-2">Current Residence</div>
                    <div className="text-sm space-y-1 text-gray-600">
                      <div>{formData.currentAddress}</div>
                      <div>{formData.currentCity}, {formData.currentState} {formData.currentZip}</div>
                      <div>Rent: ${formData.monthlyRent}/mo</div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="font-semibold mb-2">Employment</div>
                    <div className="text-sm space-y-1 text-gray-600">
                      <div>{formData.employer}</div>
                      <div>{formData.position}</div>
                      <div>Monthly Income: ${formData.monthlyIncome}</div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="font-semibold text-yellow-900 mb-2">Consent & Authorization</div>
                      <div className="text-sm text-yellow-700 space-y-2">
                        <p>
                          By clicking "Pay & Submit", you authorize LeaseFlow and the property owner to:
                        </p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li>Obtain consumer credit reports for rental screening</li>
                          <li>Conduct criminal background checks</li>
                          <li>Verify employment and income information</li>
                          <li>Contact previous landlords and references</li>
                        </ul>
                        <p className="pt-2">
                          This is a "soft pull" credit check and will not affect your credit score.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="font-semibold">Screening Fee</div>
                        <div className="text-sm text-gray-600">One-time payment</div>
                      </div>
                      <div className="text-2xl font-bold">
                        ${property.screeningPackage === "premium" ? "59.99" : "39.99"}
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 text-xs text-gray-600">
                      <Shield className="w-4 h-4 inline-block mr-1" />
                      Secure payment processing · This is a demo - no real payment will be processed
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={prevStep} className="flex-1">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button onClick={nextStep} className="flex-1 bg-green-600 hover:bg-green-700">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Pay & Submit
                </Button>
              </div>
            </div>
          )}

          {/* Step 7: Confirmation */}
          {currentStep === 7 && (
            <div className="text-center space-y-6 py-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Application Submitted!
                </h1>
                <p className="text-lg text-gray-600">
                  Your screening is being processed
                </p>
              </div>

              <Card className="text-left">
                <CardContent className="p-6 space-y-4">
                  <div>
                    <div className="font-semibold mb-1">What happens next?</div>
                    <ul className="text-sm text-gray-600 space-y-2">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" />
                        <span>We'll process your background and credit screening (typically 1-2 hours)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" />
                        <span>The landlord will review your complete screening report</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" />
                        <span>You'll receive an email when a decision is made</span>
                      </li>
                    </ul>
                  </div>

                  <div className="border-t pt-4">
                    <div className="font-semibold mb-1">Your Application ID</div>
                    <div className="font-mono text-sm bg-gray-50 p-3 rounded">
                      APP-{Date.now().toString().slice(-8)}
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="text-sm text-gray-600">
                      Questions? Contact us at{" "}
                      <span className="text-primary font-medium">support@leaseflow.app</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex flex-col gap-3">
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => router.push("/")}
                >
                  Return to Home
                </Button>
                <Button 
                  variant="ghost"
                  onClick={() => router.push("/dashboard")}
                >
                  View as Landlord (Demo)
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
