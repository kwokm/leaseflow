import Link from "next/link";
import { DeskToolbar } from "@/components/desk/packet-window";
import {
  getApplicantById,
  getPropertyById,
  mockPayments,
} from "@/lib/data/mock-data";
import { Reveal } from "@/components/motion/reveal";
import { shortAddress } from "@/lib/desk/display";

const kindLabels: Record<string, string> = {
  screening_fee: "Screening fee",
  holding_deposit: "Holding deposit",
  payout: "Payout",
};

export default function PaymentsPage() {
  const ledger = [...mockPayments].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <Reveal>
      <DeskToolbar meta="Preview · mock ledger">
        <span className="desk-pill is-on">Received</span>
      </DeskToolbar>
      <div className="overflow-x-auto">
        <table className="app-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Applicant</th>
              <th>Property</th>
              <th>Status</th>
              <th className="num">Amount</th>
            </tr>
          </thead>
          <tbody>
            {ledger.map((payment) => {
              const applicant = payment.applicantId
                ? getApplicantById(payment.applicantId)
                : undefined;
              const property = payment.propertyId
                ? getPropertyById(payment.propertyId)
                : undefined;

              return (
                <tr key={payment.id}>
                  <td>{new Date(payment.createdAt).toLocaleDateString()}</td>
                  <td>
                    {payment.description}
                    <div className="text-[12px] text-mute">{kindLabels[payment.kind]}</div>
                  </td>
                  <td>
                    {applicant ? (
                      <Link
                        href={`/dashboard/applications/${applicant.id}`}
                        className="text-ink transition-colors duration-240 ease-premium hover:underline"
                      >
                        {applicant.firstName} {applicant.lastName}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>{property ? shortAddress(property.address) : "—"}</td>
                  <td>
                    <span
                      className={
                        payment.status === "paid"
                          ? "status status-ok"
                          : payment.status === "refunded"
                            ? "status status-no"
                            : "status"
                      }
                    >
                      {payment.status === "paid"
                        ? "Completed"
                        : payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                    </span>
                  </td>
                  <td className="num score">
                    {payment.kind === "payout" ? "−" : "+"}${payment.amount.toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Reveal>
  );
}
