# Leaseproof

A high-fidelity, clickable product prototype for a modern tenant screening and rental application web service. Built with Next.js, TypeScript, and Tailwind CSS.

> **Note**: This is a frontend prototype with mock data only. No real credit bureaus, payment processors, or authentication providers are integrated.

## Features

### 1. Marketing Landing Page (`/`)
- Professional SaaS landing page for landlords and agents
- Hero section with clear value proposition
- How it works (4-step process)
- Comprehensive screening report details
- Transparent pricing (Standard $39.99 / Premium $59.99)
- Call-to-action buttons to dashboard and demo apply flow

### 2. Landlord Dashboard (`/dashboard`)
- Overview stats: Active listings, pending applications, completed screenings
- Properties list with applicant counts and statuses
- Recent applicants with quick access to reports
- Quick actions: Create listing, copy apply links, view reports

### 3. Property Management
- **Create Listing** (`/dashboard/listings/new`): Form to add new rental properties
- **Listing Details** (`/dashboard/listings/[id]`): View property with all applicants, copy shareable apply link
- Choose screening package (Standard or Premium)

### 4. Renter Apply Flow (`/apply/[listingId]`)
Mobile-friendly multi-step wizard:
1. **Start**: Property summary and what to expect
2. **Personal Info**: Name, contact, DOB, SSN
3. **Residential History**: Current address and landlord info
4. **Employment & Income**: Employer, position, income, supervisor
5. **Additional Info**: Household members, pets, vehicles
6. **Review & Consent**: Summary, FCRA consent, mock payment ($39.99 or $59.99)
7. **Confirmation**: Success message with next steps

### 5. Screening Reports (`/dashboard/applicants/[id]`)
Beautiful, detailed report with:
- **LeaseScore™**: Custom credit score (300-850 range) with color-coded rating
- **Credit Summary**: Payment history, utilization, accounts, derogatory marks, inquiries
- **Background Check**: Criminal, eviction, sex offender status with clear/records-found indicators
- **Income Verification**: Employer, position, monthly income, rent-to-income ratio
- **Residential History**: Previous addresses with landlord verification status
- **Decision Actions**: Approve, decline (with adverse action notice preview), request more info

### 6. Demo Features
- Role switcher in dashboard sidebar to jump between landlord/renter views
- Multiple sample properties with varied applicant statuses
- Rich mock data: 3 properties, 6 applicants, 4 complete screening reports
- Realistic empty states and loading states

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v3.4
- **Components**: Custom UI components (shadcn/ui style)
- **Icons**: Lucide React
- **State Management**: React hooks (no external state library needed for prototype)

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Demo Walkthrough

### Path 1: Landlord Experience

1. **Landing Page** → Click "Get Started Free" or "Sign In"
2. **Dashboard** (`/dashboard`)
   - View overview stats and properties
   - See recent applicants with various statuses
3. **Create New Listing** → Click "Create Listing" button
   - Fill in property details
   - Choose screening package
4. **View Property Details** → Click "View Details" on any property
   - See all applicants for that property
   - Copy application link to share
5. **Review Screening Report** → Click "View Report" on completed applicants
   - See comprehensive LeaseScore, credit, background checks
   - Try "Decline" to preview adverse action notice
   - Note different reports for different applicants (approved, declined, completed)

### Path 2: Renter Experience

1. **Landing Page** → Click "View Demo Application"
2. **Apply Flow** (`/apply/prop-1`)
   - Step through the 7-step application wizard
   - Fill in mock data (all fields required for demo purposes)
   - Review and "pay" (no real payment)
   - See confirmation screen
3. **Return to Dashboard** → Click "View as Landlord (Demo)"

### Pre-populated Demo Data

**Sample Properties:**
- 742 Evergreen Terrace, Springfield, IL - 3br/2ba - $2,400/mo (Premium)
- 123 Main Street Unit 4B, Chicago, IL - 2br/1ba - $1,850/mo (Standard)
- 456 Oak Avenue, Austin, TX - 4br/3ba - $3,200/mo (Premium)

**Sample Applicants with Reports:**
- **Sarah Johnson** (Completed, LeaseScore 785) - Excellent credit, clean background
- **Emily Rodriguez** (Approved, LeaseScore 820) - Best-case applicant
- **James Wilson** (Declined, LeaseScore 580) - Records found, low score
- **Jessica Martinez** (Completed, LeaseScore 695) - Mid-range applicant

**Applicants in Progress:**
- Michael Chen (In Progress)
- David Park (Invited)

## File Structure

```
leaseflow/
├── app/
│   ├── dashboard/
│   │   ├── applicants/[id]/page.tsx    # Screening report
│   │   ├── listings/
│   │   │   ├── new/page.tsx            # Create listing
│   │   │   └── [id]/page.tsx           # Listing detail
│   │   ├── layout.tsx                  # Dashboard layout
│   │   └── page.tsx                    # Dashboard home
│   ├── apply/[listingId]/page.tsx      # Multi-step apply flow
│   ├── layout.tsx                       # Root layout
│   ├── page.tsx                         # Landing page
│   └── globals.css                      # Global styles
├── components/
│   └── ui/                              # Reusable UI components
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── badge.tsx
│       ├── dialog.tsx
│       └── progress.tsx
├── lib/
│   ├── data/
│   │   └── mock-data.ts                # All mock data and types
│   └── utils.ts                         # Utility functions
└── README.md
```

## Design

Visual lock lives in the landing screenshot and `app/globals.css` (lilac bloom, Inter, screenshot card). **Motion** follows [`design/animations-rules.md`](./design/animations-rules.md) — see also [`design/NOTES.md`](./design/NOTES.md). Landing gray secondaries use reversible split-text. Do not restyle Leaseproof into another product’s look. The npm package and repo stay `leaseflow`.

## Design Principles

- **Production-quality**: Refined spacing, typography, and component design
- **Mobile-first**: Fully responsive, especially the apply flow
- **Accessible**: Semantic HTML, proper labels, keyboard navigation
- **Realistic states**: Empty states, loading indicators, success/error feedback
- **Information hierarchy**: Clear visual organization of complex data
- **Trustworthy**: Professional styling appropriate for financial/screening services

## Mock Data & Limitations

- **No Backend**: All data lives in `lib/data/mock-data.ts`
- **No Real Auth**: No login/logout, user is always "John Landlord"
- **No Payment Processing**: Payment button shows success without Stripe
- **No Credit Bureaus**: LeaseScore and credit data are fictional
- **No Email**: No actual notifications sent
- **Session Persistence**: Form data resets on page refresh

## Customization

To modify mock data:
1. Edit `lib/data/mock-data.ts`
2. Add/remove properties, applicants, or reports
3. Update status counts and relationships

To change branding:
1. Update colors in `tailwind.config.ts`
2. Change logo/name in headers (search for "Leaseproof")
3. Modify global styles in `app/globals.css`

## Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari 14+
- Mobile Safari & Chrome (iOS 14+, Android 10+)

## License

This is a demo/prototype project. All code is provided as-is for demonstration purposes.

## Credits

Built with:
- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)
- [Radix UI](https://www.radix-ui.com/) primitives

Inspired by rental screening platforms but with distinct branding and no trademark infringement.

---

**Leaseproof** — working name for this screening and leasing-ops prototype.
