# Leaseproof

A high-fidelity, clickable prototype for tenant screening, rental applications, and shared renter packets. Built with Next.js, TypeScript, Tailwind CSS, and mock browser-local data.

> No real credit bureau, payment processor, authentication provider, email service, or document storage is connected.

## Product flow

### Landlord

1. Open `/signin` and use the mock Google or email flow.
2. A new account opens an empty screening pipeline.
3. Create a property at `/dashboard/listings/new`.
4. Copy its apply link or open a pre-addressed email invite from the listing.
5. Review submitted packets in `/dashboard/applications`.

Use the quiet **Load demo** control on the empty pipeline to add the four seeded properties and sample applicants. Demo data is never the first-run default.

### Renter

1. Open `/apply/[listingId]`.
2. Start with an empty nine-step application, or select **Fill demo** to load fictional Jane Doe data.
3. Add identity, income, bank, credit, household, consent, and mock payment details.
4. Review and submit after validation passes.
5. Print the receipt or open `/packet/[applicantId]`.

Unknown listing IDs return a 404 instead of silently remapping to a different property.

## Pricing

One Standard plan: **Applicants pay $24.99; Experian is included, $0 extra for landlords.**

Standard is the only package in the product UI and data model.

## Main routes

- `/` — landing, Platform, and Pricing sections
- `/signin` — mock landlord authentication
- `/dashboard` — screening-first landlord pipeline
- `/dashboard/listings/new` — listing creation and prototype Zillow import
- `/dashboard/listings/[id]` — property, invite, and copy-link actions
- `/dashboard/applications/[id]` — landlord packet and decision actions
- `/apply/[listingId]` — renter application
- `/packet/[id]` — shareable renter packet
- `/realtor` — redirect to the gated landlord dashboard

Leasing-operations routes remain available as prototype extensions, but Pipeline, Applications, and Properties lead the landlord experience. Payments is not shown in the desk rail.

## Local development

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
```

## Data and security limitations

- Landlord auth is a browser-local prototype session with a routing cookie, not production authentication.
- Listings, decisions, drafts, submissions, and demo state are stored in localStorage.
- Uploaded files never leave the browser. Object URL previews expire; restored packets label them “Preview unavailable after reload.”
- Experian, background, LeaseScore, AI income, payments, notifications, and leases are mock-only.
- Shared packet links are prototype links and are not a production authorization model.

## Design

The visual source of truth is `design/attio-inspired/`: Inter, the lilac wash, and PacketWindow chrome. Motion rules live in [`design/animations-rules.md`](./design/animations-rules.md).
