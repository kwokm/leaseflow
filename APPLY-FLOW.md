# Leaseproof apply flow

The renter flow lives at `/apply/[listingId]` and uses the same Inter, lilac wash, and PacketWindow chrome as the landing page and landlord desk.

## Pricing

**Applicants pay $24.99; Experian is included, $0 extra for landlords.**

Standard is the only package. The prototype checkout never charges a card.

## First run

- A valid listing ID is required; unknown IDs return 404.
- The application starts empty and saves a draft in this browser.
- **Fill demo** loads fictional Jane Doe data for a fast walkthrough.
- Future stages stay locked until the current stage validates.

## Stages

Visible stepper: **You · Proof · Credit · Pay**. Done is the receipt after Pay, not a fifth rail item.

1. **You** — listing/start (including Fill demo and $24.99), personal identity, and household, composed as one stage.
2. **Proof** — Photo ID, income, and bank uploads, composed as sections. Files stay on this device.
3. **Credit** — explicitly mocked Experian authorization and score. No live bureau.
4. **Pay** — review, consent, signature, and mock card fields.
5. **Done** (not in the stepper) — renter receipt and link to the submitted renter packet.

Validation runs before every forward stage and again before Pay submits. The final renter path ends at the receipt and shared packet. Drafts use `APPLY_STATE_VERSION` 6; a version mismatch starts a fresh empty draft.

## Storage behavior

- Drafts and submissions use localStorage.
- File bytes are never uploaded; only metadata and temporary object URLs exist.
- Object URLs are removed from persisted submissions.
- Restored landlord packet rows explicitly say **Preview unavailable after reload**.
- Card details are never persisted.

## Prototype-only integrations

Experian, background searches, AI income checks, payment, notifications, and document storage are simulations. No bureau credentials are collected and no live consumer report is requested.
