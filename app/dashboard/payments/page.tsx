import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Banknote, CreditCard, Clock, Wrench } from "lucide-react";
import {
  getApplicantById,
  getPaymentStatusColor,
  getPropertyById,
  mockPayments,
} from "@/lib/data/mock-data";

const kindLabels: Record<string, string> = {
  screening_fee: "Screening fee",
  holding_deposit: "Holding deposit",
  payout: "Payout",
};

export default function PaymentsPage() {
  const ledger = [...mockPayments].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const collected = ledger
    .filter((p) => p.kind !== "payout" && p.status === "paid")
    .reduce((sum, p) => sum + p.amount, 0);
  const pending = ledger
    .filter((p) => p.status === "pending")
    .reduce((sum, p) => sum + p.amount, 0);
  const refunded = ledger
    .filter((p) => p.status === "refunded")
    .reduce((sum, p) => sum + p.amount, 0);

  const stats = [
    { label: "Collected", value: collected, icon: Banknote, hint: "Fees and deposits received" },
    { label: "Pending", value: pending, icon: Clock, hint: "Awaiting payment or transfer" },
    { label: "Refunded", value: refunded, icon: CreditCard, hint: "Returned to applicants" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-ink">Payments</h1>
        <p className="text-mute mt-1">Screening fees, deposits, and payouts</p>
      </div>

      {/* Stub notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
        <Wrench className="w-5 h-5 text-amber-600 mt-0.5" />
        <div>
          <div className="font-semibold text-amber-900">Preview — not yet connected</div>
          <div className="text-sm text-amber-800">
            Payments is a stub in this prototype. The ledger below is mock data; connecting a
            payout account and processing real transactions is not implemented.
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-mute">{stat.label}</CardTitle>
              <stat.icon className="w-4 h-4 text-mute-3" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                ${stat.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-mute-2 mt-1">{stat.hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Ledger */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Transactions</CardTitle>
          <Button variant="outline" size="sm" disabled>
            Export CSV
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-mist text-left text-xs uppercase tracking-wide text-mute-2">
                  <th scope="col" className="px-6 py-3 font-medium">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 font-medium">
                    Description
                  </th>
                  <th scope="col" className="px-6 py-3 font-medium">
                    Applicant
                  </th>
                  <th scope="col" className="px-6 py-3 font-medium">
                    Method
                  </th>
                  <th scope="col" className="px-6 py-3 font-medium">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 font-medium text-right">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {ledger.map((payment) => {
                  const applicant = payment.applicantId
                    ? getApplicantById(payment.applicantId)
                    : undefined;
                  const property = payment.propertyId
                    ? getPropertyById(payment.propertyId)
                    : undefined;

                  return (
                    <tr key={payment.id} className="hover:bg-mist transition-colors">
                      <td className="px-6 py-4 text-mute whitespace-nowrap">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-ink">{payment.description}</div>
                        <div className="text-xs text-mute-2">
                          {kindLabels[payment.kind]}
                          {property ? ` · ${property.address}` : ""}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-mute">
                        {applicant ? (
                          <Link
                            href={`/dashboard/applications/${applicant.id}`}
                            className="hover:text-primary hover:underline"
                          >
                            {applicant.firstName} {applicant.lastName}
                          </Link>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-6 py-4 text-mute">{payment.method}</td>
                      <td className="px-6 py-4">
                        <Badge className={`capitalize ${getPaymentStatusColor(payment.status)}`}>
                          {payment.status}
                        </Badge>
                      </td>
                      <td
                        className={`px-6 py-4 text-right font-semibold ${
                          payment.kind === "payout" ? "text-mute" : "text-ink"
                        }`}
                      >
                        {payment.kind === "payout" ? "-" : "+"}$
                        {payment.amount.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
