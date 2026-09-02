import type {
  Applicant,
  ApplicationDetails,
  ExperianPull,
  Property,
  ScreeningReport,
} from "@/lib/data/mock-data";
import { getScoreLabel, getStatusLabel, groupDocuments } from "@/lib/data/mock-data";

export interface PacketInput {
  applicant: Applicant;
  property: Property;
  details?: ApplicationDetails;
  report?: ScreeningReport;
  experian?: ExperianPull;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatDate(value?: string): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}

function currency(value: number): string {
  return `$${value.toLocaleString()}`;
}

function rows(pairs: [string, string][]): string {
  return pairs
    .map(
      ([label, value]) =>
        `<tr><th scope="row">${escapeHtml(label)}</th><td>${escapeHtml(value)}</td></tr>`
    )
    .join("");
}

function section(title: string, body: string): string {
  return `<section><h2>${escapeHtml(title)}</h2>${body}</section>`;
}

/**
 * Renders the application packet as a self-contained HTML document so it can be
 * saved, emailed, or printed to PDF without the app running.
 */
export function buildPacketHtml({
  applicant,
  property,
  details,
  report,
  experian,
}: PacketInput): string {
  const name = `${applicant.firstName} ${applicant.lastName}`;
  const ai = report?.aiIncome;
  const monthly = ai?.grossMonthly ?? report?.income.monthlyIncome;
  const coTenants = details?.occupants.filter((row) => row.relationship === "Co-tenant") ?? [];

  const summary = section(
    "Application Summary",
    `<table>${rows([
      ["Applicant", name],
      ["Email", applicant.email],
      ["Phone", applicant.phone],
      ["Property", property.address],
      ["Monthly rent", currency(property.rent)],
      ["Status", getStatusLabel(applicant.status)],
      ["Applied", formatDate(applicant.appliedAt)],
      ["Completed", formatDate(applicant.completedAt)],
      ["Screening package", "Standard"],
      [
        "Applying with",
        coTenants.map((row) => `${row.name} (Co-tenant)`).join("; ") || "—",
      ],
    ])}</table>`
  );

  const scoreBlock = report
    ? section(
        "LeaseScore",
        `<div class="score"><div class="score-value">${report.credit.leaseScore}</div>
         <div class="score-label">${escapeHtml(
           getScoreLabel(report.credit.leaseScore)
         )} · range 300–850</div></div>
         <table>${rows([
           ["Payment history", `${report.credit.paymentHistory}% on time`],
           ["Credit utilization", `${report.credit.creditUtilization}%`],
           ["Total accounts", String(report.credit.totalAccounts)],
           ["Derogatory marks", String(report.credit.derogatoryMarks)],
           ["Hard inquiries", String(report.credit.hardInquiries)],
         ])}</table>`
      )
    : section(
        "LeaseScore",
        `<p class="muted">Screening has not completed for this application yet.</p>`
      );

  const backgroundBlock = report
    ? section(
        "Background Check",
        `<table>${rows([
          ["Criminal", report.background.criminal === "clear" ? "Clear" : "Records found"],
          ["Eviction", report.background.eviction === "clear" ? "Clear" : "Records found"],
          [
            "Sex offender registry",
            report.background.sexOffender === "clear" ? "Clear" : "Records found",
          ],
          ["Details", report.background.details ?? "None"],
        ])}</table>`
      )
    : "";

  const incomeRows: [string, string][] = report
    ? [
        ["Employer", report.income.employer],
        ["Position", report.income.position],
        ["AI income", ai ? `${currency(ai.grossMonthly)} / mo gross` : "—"],
        [
          "AI source",
          ai
            ? ai.documents
                .map((doc) => `${doc.name} (${doc.note})`)
                .join("; ") || ai.source
            : "—",
        ],
        ["Monthly income", monthly ? currency(monthly) : "—"],
        ["Verification", report.income.verified || ai?.verified ? "Verified" : "Not verified"],
        [
          "Rent-to-income",
          monthly ? `${Math.round((property.rent / monthly) * 100)}%` : "—",
        ],
      ]
    : [];

  const incomeBlock = report
    ? section("Income & Employment (verified)", `<table>${rows(incomeRows)}</table>`)
    : "";

  const submittedBlock = details
    ? [
        section(
          "Applicant-Provided Information",
          `<table>${rows([
            ["Date of birth", formatDate(details.dateOfBirth)],
            ["SSN", `•••-••-${details.ssnLast4}`],
            ["Desired move-in", formatDate(details.desiredMoveIn)],
          ])}</table>`
        ),
        section(
          "Current Residence",
          `<table>${rows([
            ["Address", details.currentAddress.address],
            ["Resident since", details.currentAddress.since],
            ["Monthly rent", currency(details.currentAddress.monthlyRent)],
            ["Landlord", details.currentAddress.landlordName],
            ["Landlord phone", details.currentAddress.landlordPhone],
            ["Reason for leaving", details.currentAddress.reasonForLeaving],
          ])}</table>`
        ),
        section(
          "Employment (self-reported)",
          `<table>${rows([
            ["Employer", details.employment.employer],
            ["Position", details.employment.position],
            ["Start date", details.employment.startDate],
            ["Supervisor", details.employment.supervisor],
            ["Supervisor phone", details.employment.supervisorPhone],
            ["Monthly income", currency(details.employment.monthlyIncome)],
          ])}</table>`
        ),
        section(
          "Household",
          `<table>${rows([
            [
              "Occupants",
              details.occupants
                .map((o) => `${o.name} (${o.relationship}, ${o.age})`)
                .join("; ") || "None listed",
            ],
            [
              "Pets",
              details.pets.map((p) => `${p.type} — ${p.breed}, ${p.weight}`).join("; ") ||
                "None",
            ],
            [
              "Vehicles",
              details.vehicles
                .map((v) => `${v.year} ${v.make} ${v.model} (${v.plate})`)
                .join("; ") || "None",
            ],
          ])}</table>`
        ),
        section(
          "Disclosures",
          `<table>${rows([
            ["Smoker", details.disclosures.smoker ? "Yes" : "No"],
            ["Prior eviction", details.disclosures.priorEviction ? "Yes" : "No"],
            ["Bankruptcy", details.disclosures.bankruptcy ? "Yes" : "No"],
            ["Notes", details.disclosures.notes ?? "None"],
          ])}</table>`
        ),
        section(
          "Documents",
          details.documents.length
            ? groupDocuments(details.documents)
                .map(
                  (group) =>
                    `<h3>${escapeHtml(group.label)}</h3><ul>${group.documents
                      .map(
                        (doc) =>
                          `<li>${escapeHtml(doc.name)}${
                            doc.sizeLabel ? ` — ${escapeHtml(doc.sizeLabel)}` : ""
                          }, uploaded ${formatDate(doc.uploadedAt)}${
                            doc.previewAvailable === false
                              ? " — preview unavailable after reload"
                              : ""
                          }</li>`
                      )
                      .join("")}</ul>`
                )
                .join("")
            : `<p class="muted">No documents uploaded.</p>`
        ),
        section(
          "Consent",
          `<table>${rows([
            ["Signature", details.consent.signature],
            ["Accepted", formatDate(details.consent.acceptedAt)],
            ["IP address", details.consent.ipAddress],
          ])}</table>`
        ),
      ].join("")
    : section(
        "Applicant-Provided Information",
        `<p class="muted">This applicant has been invited but has not submitted an application.</p>`
      );

  const experianBlock = experian
    ? section(
        `Credit report — ${experian.provider}`,
        `<div class="score"><div class="score-value">${experian.score}</div>
         <div class="score-label">${escapeHtml(experian.scoreModel)} · pulled ${formatDate(
           experian.pulledAt
         )}</div></div>
         <table>${rows([
           ["File matched", experian.fileMatched ? "Yes" : "No"],
           ["On-time payments", `${experian.onTimePaymentRate}%`],
           ["Open accounts", String(experian.openAccounts)],
           ["Oldest account", `${experian.oldestAccountYears} years`],
           ["Recent inquiries", String(experian.recentInquiries)],
           ["Public records", String(experian.publicRecords)],
           ["Extra Experian fee", "$0.00"],
         ])}</table>
         ${
           experian.factors.length
             ? `<ul>${experian.factors.map((f) => `<li>${escapeHtml(f)}</li>`).join("")}</ul>`
             : ""
         }
         <p class="muted">Mock pull. No consumer reporting agency was contacted and no bureau
         credentials were collected.</p>`
      )
    : section(
        "Credit report",
        `<p class="muted">No credit report is attached to this application.</p>`
      );

  const residentialBlock = report?.residentialHistory.length
    ? section(
        "Residential History",
        `<ul>${report.residentialHistory
          .map(
            (r) =>
              `<li>${escapeHtml(r.address)} — ${escapeHtml(r.from)} to ${escapeHtml(r.to)} (${
                r.landlordVerified ? "landlord verified" : "not verified"
              })</li>`
          )
          .join("")}</ul>`
      )
    : "";

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Application Packet — ${escapeHtml(name)}</title>
<style>
  body { font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; color: #1C1D1F; margin: 0; padding: 40px; font-weight: 500; letter-spacing: -0.16px; }
  header { border-bottom: 1px solid #C9D0D9; padding-bottom: 16px; margin-bottom: 24px; }
  h1 { font-size: 24px; margin: 0 0 4px; font-weight: 600; letter-spacing: -0.5px; }
  h2 { font-size: 12px; text-transform: uppercase; letter-spacing: 0.06em; color: #6D7988; margin: 28px 0 8px; }
  h3 { font-size: 13px; margin: 14px 0 4px; color: #4E5967; font-weight: 600; }
  .sub { color: #6D7988; font-size: 14px; }
  table { width: 100%; border-collapse: collapse; font-size: 14px; }
  th, td { text-align: left; padding: 6px 8px; border-bottom: 1px solid #E3E7EC; vertical-align: top; }
  th { width: 34%; color: #6D7988; font-weight: 500; }
  ul { font-size: 14px; padding-left: 20px; }
  .muted { color: #6D7988; font-size: 14px; }
  .score { margin: 8px 0 16px; }
  .score-value { font-size: 44px; font-weight: 600; color: #1C1D1F; line-height: 1; letter-spacing: -1.4px; }
  .score-label { color: #6D7988; font-size: 14px; margin-top: 4px; }
  footer { margin-top: 32px; padding-top: 12px; border-top: 1px solid #E3E7EC; color: #6D7988; font-size: 12px; }
  section { break-inside: avoid; }
</style>
</head>
<body>
<header>
  <h1>Application Packet — ${escapeHtml(name)}</h1>
  <div class="sub">${escapeHtml(property.address)}</div>
</header>
${summary}
${scoreBlock}
${experianBlock}
${backgroundBlock}
${incomeBlock}
${residentialBlock}
${submittedBlock}
<footer>
  Generated by Leaseproof. Screening data on this packet is fictional — no consumer reporting
  agency was used.
</footer>
</body>
</html>`;
}

export function downloadPacket(input: PacketInput) {
  const html = buildPacketHtml(input);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `leaseproof-packet-${input.applicant.firstName}-${input.applicant.lastName}.html`.toLowerCase();
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
