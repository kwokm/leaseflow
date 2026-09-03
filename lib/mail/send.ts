import "server-only";

import { appOrigin } from "@/lib/config/env";

export type QueuedEmail = {
  to: string;
  subject: string;
  text: string;
  enclosureHref: string;
  enclosureTitle: string;
};

export type MailResult =
  | { status: "sent"; provider: string }
  | { status: "queued"; reason: string; queued: QueuedEmail };

function mailFrom(): string | null {
  return process.env.MAIL_FROM?.trim() || null;
}

function resendKey(): string | null {
  return process.env.RESEND_API_KEY?.trim() || null;
}

export function mailerConfigured(): boolean {
  return Boolean(resendKey() && mailFrom());
}

/**
 * Deliver a written notice by email, or queue it. Never reports a send unless
 * a mailer accepted the message.
 */
export async function sendOrQueueEmail(input: QueuedEmail): Promise<MailResult> {
  const key = resendKey();
  const from = mailFrom();

  if (!key || !from) {
    return {
      status: "queued",
      reason: "No mailer is configured. The notice is archived in the packet.",
      queued: input,
    };
  }

  const enclosureUrl = input.enclosureHref.startsWith("http")
    ? input.enclosureHref
    : `${appOrigin()}${input.enclosureHref}`;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [input.to],
        subject: input.subject,
        text: input.text,
        attachments: [
          {
            filename: "cfpb-regulation-v-appendix-k-summary-of-rights.pdf",
            path: enclosureUrl,
          },
        ],
      }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.error("[mail] Resend rejected the adverse-action email.", response.status, detail);
      return {
        status: "queued",
        reason: "The mailer did not accept the message. The notice is archived in the packet.",
        queued: input,
      };
    }

    return { status: "sent", provider: "resend" };
  } catch (error) {
    console.error("[mail] Could not reach the mailer.", error);
    return {
      status: "queued",
      reason: "The mailer could not be reached. The notice is archived in the packet.",
      queued: input,
    };
  }
}
