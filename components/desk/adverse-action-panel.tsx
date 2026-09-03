"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Checkbox, Field } from "@/components/apply/field";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AdverseActionReceipt } from "@/components/desk/adverse-action-receipt";
import type { StoredAdverseActionNotice } from "@/lib/desk/adverse-action-store";
import {
  noticesForApplication,
  saveAdverseActionNotice,
} from "@/lib/desk/adverse-action-store";
import {
  creditScoreFromPacket,
  formatNoticeDate,
  renderAdverseActionLetter,
  renderAdverseActionSubject,
} from "@/lib/legal/adverse-action";
import {
  ADVERSE_ACTION_ACTIONS,
  ADVERSE_ACTION_HELPER,
  LANDLORD_COVID_RENTAL_DEBT_LINE,
  type AdverseActionType,
} from "@/lib/legal/fcra";
import type { ExperianPull } from "@/lib/data/mock-data";

export type LandlordContact = {
  name: string;
  address: string;
  phone: string;
  email: string;
};

export function AdverseActionPanel({
  applicationId,
  listingId,
  applicantFullName,
  applicantEmail,
  propertyAddress,
  experian,
  landlord,
  canSend,
  open: openProp,
  onOpenChange,
  hideTrigger = false,
}: {
  applicationId: string;
  listingId: string;
  applicantFullName: string;
  applicantEmail: string;
  propertyAddress: string;
  experian?: ExperianPull;
  landlord: LandlordContact;
  canSend: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  hideTrigger?: boolean;
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const open = openProp ?? uncontrolledOpen;
  const setOpen = onOpenChange ?? setUncontrolledOpen;
  const [notices, setNotices] = React.useState<StoredAdverseActionNotice[]>([]);
  const [selected, setSelected] = React.useState<Record<AdverseActionType, boolean>>({
    denied: false,
    required_cosigner: false,
    required_deposit: false,
    required_larger_deposit: false,
    charged_higher_rent: false,
    other: false,
  });
  const [otherAction, setOtherAction] = React.useState("");
  const [contact, setContact] = React.useState(landlord);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setNotices(noticesForApplication(applicationId));
  }, [applicationId]);

  React.useEffect(() => {
    setContact(landlord);
  }, [landlord]);

  React.useEffect(() => {
    let cancelled = false;
    fetch(`/api/applications/${applicationId}/adverse-action`)
      .then((response) => (response.ok ? response.json() : null))
      .then((body: { notices?: StoredAdverseActionNotice[] } | null) => {
        if (cancelled || !body?.notices?.length) return;
        for (const notice of body.notices) saveAdverseActionNotice(notice);
        setNotices(noticesForApplication(applicationId));
      })
      .catch(() => {
        // Packet copy in this browser is enough when the API is offline.
      });
    return () => {
      cancelled = true;
    };
  }, [applicationId]);

  const actionTypes = ADVERSE_ACTION_ACTIONS.filter((action) => selected[action.id]).map(
    (action) => action.id
  );
  const score = creditScoreFromPacket(experian);
  const preview = renderAdverseActionLetter({
    letterDate: formatNoticeDate(),
    applicantFullName,
    applicantEmail,
    propertyAddress,
    actionTypes,
    otherAction,
    landlordName: contact.name,
    landlordAddress: contact.address,
    landlordPhone: contact.phone,
    landlordEmail: contact.email,
    creditScore: score,
  });

  const ready =
    actionTypes.length > 0 &&
    (!selected.other || otherAction.trim().length > 0) &&
    contact.name.trim().length > 0 &&
    contact.email.trim().length > 0;

  async function send() {
    if (!ready || busy) return;
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(`/api/applications/${applicationId}/adverse-action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId,
          actionTypes,
          otherAction,
          applicantFullName,
          applicantEmail,
          propertyAddress,
          landlordName: contact.name,
          landlordAddress: contact.address,
          landlordPhone: contact.phone,
          landlordEmail: contact.email,
          score: experian
            ? {
                score: experian.score,
                scoreModel: experian.scoreModel,
                pulledAt: experian.pulledAt,
                rangeLow: experian.scoreRangeLow,
                rangeHigh: experian.scoreRangeHigh,
                factors: experian.factors,
              }
            : null,
        }),
      });
      const body = (await response.json().catch(() => null)) as {
        notice?: StoredAdverseActionNotice;
        error?: string;
      } | null;
      if (!response.ok || !body?.notice) {
        setError(body?.error || "The notice could not be archived.");
        return;
      }
      saveAdverseActionNotice(body.notice);
      setNotices(noticesForApplication(applicationId));
      setOpen(false);
    } catch {
      setError("The notice could not be archived.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <section className="border-b border-line px-5 py-5 sm:px-6">
        <h2 className="mb-3 text-[12px] font-medium uppercase tracking-[0.06em] text-mute-2">
          Adverse action
        </h2>
        <p className="text-[13px] font-medium leading-5 text-ink-2">{ADVERSE_ACTION_HELPER}</p>
        <p className="mt-3 text-[13px] font-medium leading-5 text-ink-2">
          {LANDLORD_COVID_RENTAL_DEBT_LINE}
        </p>
        {hideTrigger ? null : (
          <div className="mt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!canSend}
              onClick={() => {
                setError(null);
                setOpen(true);
              }}
            >
              Send adverse-action notice
            </Button>
          </div>
        )}
        {!canSend ? (
          <p className="mt-2 text-[12px] font-medium text-mute-2">
            A shared Experian report is needed before this notice can be generated.
          </p>
        ) : null}
      </section>

      {notices.map((notice) => (
        <section key={notice.noticeId} className="border-b border-line px-5 py-5 sm:px-6">
          <AdverseActionReceipt notice={notice} audience="landlord" />
        </section>
      ))}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Send written adverse-action notice</DialogTitle>
            <DialogDescription>
              You are taking this action. Leaseproof will generate the letter and keep a copy
              in the packet. Email is sent only if a mailer is configured — it is never faked.
            </DialogDescription>
          </DialogHeader>

          <p className="text-[13px] font-medium leading-5 text-ink-2">{ADVERSE_ACTION_HELPER}</p>

          <fieldset className="space-y-1">
            <legend className="text-[13px] font-semibold text-ink">We have taken the following action:</legend>
            {ADVERSE_ACTION_ACTIONS.map((action) => (
              <Checkbox
                key={action.id}
                id={`aa-${action.id}`}
                checked={selected[action.id]}
                onChange={(checked) =>
                  setSelected((current) => ({ ...current, [action.id]: checked }))
                }
              >
                {action.id === "other" ? "Other:" : action.label}
              </Checkbox>
            ))}
            {selected.other ? (
              <Field
                id="aa-other"
                label="Other action"
                value={otherAction}
                onChange={(event) => setOtherAction(event.target.value)}
              />
            ) : null}
          </fieldset>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field
              id="aa-landlord-name"
              label="Your name"
              value={contact.name}
              onChange={(event) => setContact((current) => ({ ...current, name: event.target.value }))}
            />
            <Field
              id="aa-landlord-email"
              label="Your email"
              type="email"
              value={contact.email}
              onChange={(event) =>
                setContact((current) => ({ ...current, email: event.target.value }))
              }
            />
            <Field
              id="aa-landlord-phone"
              label="Your phone"
              value={contact.phone}
              onChange={(event) =>
                setContact((current) => ({ ...current, phone: event.target.value }))
              }
            />
            <Field
              id="aa-landlord-address"
              label="Your address"
              value={contact.address}
              onChange={(event) =>
                setContact((current) => ({ ...current, address: event.target.value }))
              }
            />
          </div>

          <div>
            <p className="text-[13px] font-semibold text-ink">
              {renderAdverseActionSubject(propertyAddress)}
            </p>
            <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap rounded-btn border border-line bg-mist p-3 text-[12px] font-medium leading-5 text-ink-2">
              {preview}
            </pre>
          </div>

          {error ? <p className="text-[13px] font-medium text-no">{error}</p> : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="button" disabled={!ready || busy} onClick={() => void send()}>
              {busy ? "Sending…" : "Confirm and send"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

