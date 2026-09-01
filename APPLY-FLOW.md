# Leaseproof apply flow

The renter flow lives at `/apply/[listingId]` and uses the same Inter, lilac wash, and PacketWindow chrome as the landing page and landlord desk.

## Pricing

**Applicants pay $24.99; Experian is included, $0 extra for landlords.**

Standard is the only package. The prototype checkout never charges a card.

## First run

- A valid listing ID is required; unknown IDs return 404.
- The application starts empty and saves a draft in this browser.
- **Fill demo** loads fictional Jane Doe data for a fast walkthrough.
- Future steps stay locked until the current step validates.

## Steps

1. **Start** — property, Standard pricing, requirements, optional Fill demo.
2. **You** — name, contact, date of birth, SSN, and address.
3. **Photo ID** — front and back metadata for a local image or PDF.
4. **Income** — income source and two recent pay stubs.
5. **Bank** — bank name and one to three recent statements.
6. **Credit** — explicitly mocked Experian authorization and score.
7. **Household** — optional pets, occupants, and disclosures.
8. **Review and pay** — summary, consent, signature, and mock card fields.
9. **Done** — renter receipt and link to the submitted renter packet.

Validation runs before every forward step and again before Review submits payment. The final renter path ends at the receipt and shared packet.

## Storage behavior

- Drafts and submissions use localStorage.
- File bytes are never uploaded; only metadata and temporary object URLs exist.
- Object URLs are removed from persisted submissions.
- Restored landlord packet rows explicitly say **Preview unavailable after reload**.
- Card details are never persisted.

## Prototype-only integrations

Experian, background searches, AI income checks, payment, notifications, and document storage are simulations. No bureau credentials are collected and no live consumer report is requested.
