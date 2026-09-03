import Link from "next/link";
import { formatDateTime } from "@/lib/apply/format";
import { SummaryRow } from "@/components/apply/step-shell";
import type { StoredAdverseActionNotice } from "@/lib/desk/adverse-action-store";
import { CFPB_SUMMARY_OF_RIGHTS_TITLE } from "@/lib/legal/fcra";

export function AdverseActionReceipt({
  notice,
  audience,
}: {
  notice: StoredAdverseActionNotice;
  audience: "landlord" | "applicant";
}) {
  const heading =
    audience === "landlord"
      ? "Written adverse-action notice sent"
      : "Written adverse-action notice received";
  const deck =
    audience === "landlord"
      ? "Leaseproof generated this notice for you. You are the one who took the action."
      : "You received this written notice about an action taken on your application.";

  return (
    <section className="rounded-lg border border-line bg-paper p-5 shadow-window">
      <h2 className="text-[17px] font-semibold tracking-[-0.3px] text-ink">{heading}</h2>
      <p className="mt-1 text-[13px] font-medium leading-5 text-mute">{deck}</p>
      <dl className="mt-3">
        <SummaryRow label="Subject" value={notice.letterSubject} />
        <SummaryRow label="When" value={formatDateTime(notice.sentAt)} />
        <SummaryRow label="Copy version" value={notice.copyVersion} />
        <SummaryRow
          label="Delivery"
          value={
            notice.emailStatus === "sent"
              ? "Email sent · packet copy kept"
              : "Queued for email · packet copy kept"
          }
        />
      </dl>
      {notice.emailStatus === "queued" && notice.emailQueuedReason ? (
        <p className="mt-3 text-[13px] font-medium leading-5 text-mute">
          {notice.emailQueuedReason}
        </p>
      ) : null}
      <pre className="mt-4 whitespace-pre-wrap rounded-btn border border-line bg-mist p-4 text-[13px] font-medium leading-5 text-ink-2">
        {notice.letterText}
      </pre>
      <p className="mt-3 text-[13px] font-medium leading-5 text-mute">
        Enclosed:{" "}
        <Link
          href={notice.enclosureHref}
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-2"
        >
          {CFPB_SUMMARY_OF_RIGHTS_TITLE}
        </Link>
      </p>
    </section>
  );
}
