# Leaseproof apply flow

The renter flow lives at `/apply/[listingId]` and uses the same Inter, lilac wash, and PacketWindow chrome as the landing page and landlord desk.

## Pricing

**Applicants pay $24.99; Experian is included, $0 extra for landlords.**

Standard is the only package. The fee is charged through Stripe Checkout.

## First run

- A valid listing ID is required; unknown IDs return 404. The listing is resolved on the server, so a bad id never renders an empty packet.
- The application starts empty and saves a draft in this browser.
- **Fill demo** loads fictional Jane Doe data for a fast walkthrough.
- Future stages stay locked until the current stage validates.

## Stages

Visible stepper: **You · Proof · Credit · Pay**. Done is the receipt after Pay, not a fifth rail item.

1. **You** — listing/start (including Fill demo and $24.99), personal identity, and household, composed as one stage.
2. **Proof** — Photo ID, income, and bank uploads, composed as sections. Files upload to Blob storage and survive a reload.
3. **Credit** — Experian Connect authorization. The applicant permissions the share; no report is requested here.
4. **Pay** — review, consent, signature, then Stripe Checkout.
5. **Done** (not in the stepper) — renter receipt and link to the submitted renter packet.

Validation runs before every forward stage and again before Pay submits. Drafts use `APPLY_STATE_VERSION` 7; a version mismatch starts a fresh empty draft.

## Charge then screen

The applicant pays before their credit file is touched:

1. **Pay** posts the packet to `/api/applications`, which writes it as `awaiting_payment` and records an *authorized* — not requested — credit share.
2. The browser is redirected to Stripe Checkout.
3. The Stripe webhook (`checkout.session.completed`) marks the application paid.
4. Only then does the server call `runCreditShare` and request the report.

The redirect back from Stripe is not treated as proof of payment: the receipt is shown only after the server confirms the webhook landed. Cancelling charges nothing.

## Storage behavior

- Applications, consents, documents, payments, and credit shares are stored in Neon.
- Uploaded files go to Vercel Blob as **private** objects and are read back through `/api/uploads/file`, which requires a session.
- Object URLs still provide the instant local preview and are stripped from anything persisted.
- Card details never reach this app — Stripe Checkout collects them on its own page.
- The full SSN is never stored: it is reduced to its last four digits before the packet is written, and the renter's local copy keeps only those four digits.
- Consent rows record the FCRA pack version (`lp-fcra-credit-v1.0`) the applicant actually saw.

## Integration status

Experian Connect is a server-side stub (`lib/screening/experian-connect.ts`) implementing the interface a live client will fill in; no consumer reporting agency is contacted. Background searches and AI income checks remain simulations. Clerk, Neon, Stripe, and Blob are real integrations driven by env vars.
