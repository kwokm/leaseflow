# Leaseproof

Tenant screening: a landlord posts a listing, a renter applies, pays the $24.99 screening fee, and permissions a credit share. Built with Next.js, TypeScript, and Tailwind CSS on Clerk, Neon Postgres, Stripe, and Vercel Blob.

**v1 is the screening packet only.** Not a leasing OS — no leads, showings, syndication, or rent collection.

## Product flow

### Landlord

1. Sign in at `/signin` (Google or email, via Clerk). Desk signup is **invite-only** — the email must be on `LEASEPROOF_BETA_EMAILS`.
2. A new allowlisted account opens an **empty** screening pipeline — seeded listings are demo-only (`LEASEPROOF_DEMO=1`).
3. Create a property at `/dashboard/listings/new`, or **Import listing** from a public Zillow / Redfin / Realtor.com URL (JSON-LD and Open Graph; a blocked portal is a failed import, not invented data).
4. Copy its apply link from the listing.
5. Review submitted packets in `/dashboard/applications`.

### Renter

1. Open `/apply/[listingId]`.
2. Four stages: **You · Proof · Credit · Pay**.
3. ID and income documents upload to Blob storage and survive a reload.
4. Authorize the Experian Connect share on **Credit**.
5. Pay $24.99 on **Pay** via Stripe Checkout, then get a receipt and `/packet/[id]`.

Unknown listing IDs return a 404 instead of remapping to another property.

## Charge then screen

The applicant is charged **before** their credit file is touched:

1. **Credit** step records the applicant's Experian Connect authorization. Nothing is requested from Experian.
2. **Pay** step submits the packet (status `awaiting_payment`) and redirects to Stripe Checkout.
3. The Stripe **webhook** — not the browser redirect — marks the application paid.
4. Only then does the server request the credit share.

The applicant pays once. There is no landlord surcharge.

## Experian Connect

Credit is applicant-permissioned through Experian Connect: the applicant authenticates with Experian (KBA), Experian issues a share token, and Experian releases the report to the landlord's PMC. Soft inquiry.

**No live Experian API is wired in this repo.** `lib/screening/experian-connect.ts` defines the interface a live client must implement, plus a stub. The stub returns a fabricated summary in demo mode and reports `pending` otherwise. Leaseproof never stores an SSN, bureau credentials, or a full report — only the share reference and the landlord-visible summary.

Consent copy is versioned. The authoritative wording lives in the Notion FCRA pack `lp-fcra-credit-v1.0`; the strings in `lib/legal/fcra.ts` are marked placeholders pending it, and every `consents` row records the version the applicant actually saw.

## Pricing

One Standard plan: **applicants pay $24.99; Experian is included, $0 extra for landlords.**

## Environment variables

Copy `.env.example` to `.env.local` and fill it in. **Never commit real values.**

### Clerk (authentication)

| Name | Required | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | yes | `pk_test_…` / `pk_live_…` |
| `CLERK_SECRET_KEY` | yes | `sk_test_…` / `sk_live_…` |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | no | defaults to `/signin` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | no | defaults to `/signup` |

Enable **Google** and **Email** as sign-in options in the Clerk dashboard. Roles (`landlord` / `renter`) are stamped into Clerk `publicMetadata` on first sign-in and mirrored into the `users` table.

### Neon Postgres

| Name | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | yes | Neon **pooled** connection string |

### Stripe

| Name | Required | Notes |
| --- | --- | --- |
| `STRIPE_SECRET_KEY` | yes | use `sk_test_…` — live charges stay off unless `LEASEPROOF_LIVE_FEES=1` |
| `STRIPE_WEBHOOK_SECRET` | yes | `whsec_…` from the webhook endpoint |

Point a Stripe webhook at `/api/stripe/webhook` and subscribe to `checkout.session.completed`. Locally: `stripe listen --forward-to localhost:3000/api/stripe/webhook`.

### Vercel Blob

| Name | Required | Notes |
| --- | --- | --- |
| `BLOB_READ_WRITE_TOKEN` | yes | applicant documents are stored **private** |

Documents are read back through `/api/uploads/file`, which requires a session — a blob URL is never handed to the browser.

### Leaseproof

| Name | Required | Notes |
| --- | --- | --- |
| `LEASEPROOF_DEMO` | no | `1` seeds sample listings and leaves `/dashboard` ungated. **Never set in production.** |
| `LEASEPROOF_BETA_EMAILS` | production | Comma-separated landlord emails, case-insensitive. **Empty in production means nobody new gets a desk.** Unset on `LEASEPROOF_DEMO=1` or Vercel Preview (`VERCEL_ENV=preview`) falls back to `michaelgkwok@gmail.com` and `aaisuzukillc@gmail.com`. Applicants are not on this list. |
| `LEASEPROOF_LIVE_FEES` | no | `1` allows a live Stripe key to charge $24.99. **Defaults off.** Do not set until counsel clears Cal. Civ. Code § 1950.6. Test keys work without this. |
| `NEXT_PUBLIC_APP_URL` | no | absolute origin for Stripe return URLs; falls back to `VERCEL_URL`, then localhost |

### Degradation

Every integration is optional at build time so the app compiles without secrets, and each one degrades visibly rather than silently:

- **No Clerk** → `/dashboard` redirects to `/signin` (fail-closed) unless `LEASEPROOF_DEMO=1`.
- **No `DATABASE_URL`** → listing and application writes return 503.
- **Neon unreachable** → the signed-in landlord keeps their session and still lands on the desk,
  which says it cannot load the pipeline instead of drawing an empty one. `/apply/[listingId]`
  says the same rather than 404ing a listing that probably exists.
- **No Stripe** → submitting returns 503, except under `LEASEPROOF_DEMO=1` where checkout is skipped and nothing is charged.
- **No Blob token** → uploads return 503 and previews stay session-local.

## Database

Drizzle ORM against Neon. Schema in `lib/db/schema.ts`, migrations committed under `drizzle/`.

```bash
npm run db:generate   # regenerate SQL after editing the schema
npm run db:deploy     # apply migrations to DATABASE_URL (runs as part of `npm run build`)
npm run db:migrate    # same, via drizzle-kit, for interactive use
npm run db:studio     # inspect
```

`npm run build` runs `db:deploy` first. Committed migrations are not applied by
deploying the app, and a deploy against a database whose tables were never
created takes down every page that queries Neon — so the build applies them, and
fails rather than shipping against a schema it cannot use. Without `DATABASE_URL`
the step is a no-op, so a checkout with no secrets still builds.

Tables: `users`, `listings`, `households`, `applications`, `documents`, `consents`, `payments`, `credit_shares`.

## Main routes

- `/` — landing (Sign in / Sign up in the header)
- `/apply` — ask-your-landlord apply page when there is no public listing
- `/signin`, `/signup` — Clerk authentication
- `/dashboard` — screening pipeline (Clerk session required in production)
- `/dashboard/listings/new` — listing creation and Zillow import
- `/dashboard/listings/[id]` — property and apply-link actions
- `/dashboard/applications/[id]` — landlord packet and decision actions
- `/apply/[listingId]` — renter application
- `/packet/[id]` — shareable renter packet
- `/api/stripe/webhook` — payment confirmation (signature-verified)

Pipeline, Applications, and Properties are the complete landlord navigation.

## Local development

```bash
npm install
cp .env.example .env.local   # then fill in
npm run dev
```

Production build:

```bash
npm run build
```

## Known limitations

- The Experian Connect client is a stub; no consumer reporting agency is contacted. See above.
- Background checks and LeaseScore remain mock computations.
- Approve/decline decisions are still a browser-local overlay on top of the server queue.
- Shared packet links are unguessable but not an authorization model.
- The renter's own submitted packet is cached in `localStorage` so their receipt survives a reload; it stores only the last four SSN digits, and Neon is the record of the application.

## Design

The visual source of truth is `design/attio-inspired/`: Inter, the lilac wash, and PacketWindow chrome. Motion rules live in [`design/animations-rules.md`](./design/animations-rules.md).
