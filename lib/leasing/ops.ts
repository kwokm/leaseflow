import { FEATURED_LISTING_ID, mockProperties } from "@/lib/data/mock-data";

export const MARKETPLACES = [
  { id: "zillow", name: "Zillow", status: "live" as const },
  { id: "apartments", name: "Apartments.com", status: "live" as const },
  { id: "hotpads", name: "HotPads", status: "live" as const },
  { id: "facebook", name: "Facebook", status: "pending" as const },
  { id: "craigslist", name: "Craigslist", status: "live" as const },
  { id: "more-a", name: "Realtor.com", status: "pending" as const },
  { id: "more-b", name: "Trulia", status: "pending" as const },
  { id: "more-c", name: "More boards", status: "pending" as const },
];

export type UnitStatus = "ready_to_tour" | "application_review" | "pricing_updated" | "leased";

export type PipelineUnit = {
  id: string;
  address: string;
  rent: number;
  beds: number;
  baths: number;
  status: UnitStatus;
  leads: number;
  pricing: "market_fit" | "under" | "over";
  syndication: "live" | "pending";
};

export const PIPELINE_UNITS: PipelineUnit[] = [
  {
    id: FEATURED_LISTING_ID,
    address: "170 Chorus, Irvine, CA 92618",
    rent: 6500,
    beds: 4,
    baths: 3.5,
    status: "application_review",
    leads: 6,
    pricing: "market_fit",
    syndication: "live",
  },
  {
    id: "prop-1",
    address: "14 Modesto, Irvine, CA 92602",
    rent: 7000,
    beds: 5,
    baths: 4,
    status: "ready_to_tour",
    leads: 3,
    pricing: "market_fit",
    syndication: "pending",
  },
  {
    id: "prop-2",
    address: "66 Diamond Flats, Irvine, CA 92602",
    rent: 6950,
    beds: 4,
    baths: 3.5,
    status: "ready_to_tour",
    leads: 8,
    pricing: "under",
    syndication: "pending",
  },
  {
    id: "prop-3",
    address: "141 Dolores, Irvine, CA 92618",
    rent: 6498,
    beds: 6,
    baths: 4,
    status: "pricing_updated",
    leads: 2,
    pricing: "over",
    syndication: "pending",
  },
];

export const PIPELINE_COUNTS = {
  leads: 19,
  bookings: 7,
  applications: 6,
  signed: 1,
};

export type LeadChannel = "sms" | "facebook" | "web";

export type LeadMessage = {
  id: string;
  from: "lead" | "agent";
  body: string;
  at: string;
};

export type LeadThread = {
  id: string;
  name: string;
  channel: LeadChannel;
  listingId: string;
  subject: string;
  messages: LeadMessage[];
};

export const LEAD_THREADS: LeadThread[] = [
  {
    id: "lead-maria",
    name: "Maria Santos",
    channel: "sms",
    listingId: FEATURED_LISTING_ID,
    subject: "170 Chorus inquiry",
    messages: [
      {
        id: "m1",
        from: "lead",
        body: "Hi - is 170 Chorus still available? Saw it on Zillow.",
        at: "2026-08-15T23:47:00.000Z",
      },
      {
        id: "m2",
        from: "agent",
        body: "Yes. 4 bed, 3.5 bath, $6,500/mo, September 1. Want a showing Tuesday in Irvine?",
        at: "2026-08-15T23:47:18.000Z",
      },
      {
        id: "m3",
        from: "lead",
        body: "Tuesday 10:30 works.",
        at: "2026-08-15T23:52:00.000Z",
      },
      {
        id: "m4",
        from: "agent",
        body: "Booked Tuesday 10:30 at 170 Chorus. Demo sync - not a live carrier.",
        at: "2026-08-15T23:52:12.000Z",
      },
    ],
  },
  {
    id: "lead-jane",
    name: "Jane Doe",
    channel: "web",
    listingId: FEATURED_LISTING_ID,
    subject: "Apply + showing",
    messages: [
      {
        id: "j1",
        from: "lead",
        body: "I started an application for 170 Chorus. Can I tour this week?",
        at: "2026-08-10T16:05:00.000Z",
      },
      {
        id: "j2",
        from: "agent",
        body: "Yes - Tuesday 2:00 is open, or finish the packet and we will hold a slot.",
        at: "2026-08-10T16:05:16.000Z",
      },
    ],
  },
  {
    id: "lead-fb",
    name: "Chris Nguyen",
    channel: "facebook",
    listingId: FEATURED_LISTING_ID,
    subject: "Facebook Marketplace",
    messages: [
      {
        id: "f1",
        from: "lead",
        body: "Still available? What is the move-in?",
        at: "2026-08-13T23:52:00.000Z",
      },
      {
        id: "f2",
        from: "agent",
        body: "Available September 1. I can book a showing Tuesday or Thursday. Demo sync.",
        at: "2026-08-13T23:52:14.000Z",
      },
    ],
  },
];

export type ShowingStatus = "confirmed" | "no_show" | "available" | "booked";

export type ShowingSlot = {
  id: string;
  time: string;
  listingId: string;
  address: string;
  status: ShowingStatus;
  who?: string;
};

export const TUESDAY_ROUTE: ShowingSlot[] = [
  {
    id: "slot-900",
    time: "9:00 AM",
    listingId: "prop-1",
    address: "14 Modesto, Irvine",
    status: "no_show",
    who: "Alex Kim",
  },
  {
    id: "slot-1030",
    time: "10:30 AM",
    listingId: FEATURED_LISTING_ID,
    address: "170 Chorus",
    status: "confirmed",
    who: "Maria Santos",
  },
  {
    id: "slot-1200",
    time: "12:00 PM",
    listingId: "prop-2",
    address: "66 Diamond Flats, Irvine",
    status: "confirmed",
    who: "Priya Shah",
  },
  {
    id: "slot-1400",
    time: "2:00 PM",
    listingId: FEATURED_LISTING_ID,
    address: "170 Chorus",
    status: "available",
  },
];

export const PHONE_TRANSCRIPT = [
  {
    from: "caller" as const,
    body: "Hi, I saw your listing on Zillow - is 170 Chorus still available?",
  },
  {
    from: "agent" as const,
    body: "Yes. It is a 4-bed, 3.5-bath house at $6,500 a month, available September 1. Want to book a showing?",
  },
  {
    from: "caller" as const,
    body: "Tuesday at 2pm works.",
  },
  {
    from: "agent" as const,
    body: "Booked Tuesday at 2:00 at 170 Chorus. You will get a confirmation text. This is a demo transcript - not a live dialer.",
  },
];

export function unitStatusLabel(status: UnitStatus): string {
  switch (status) {
    case "ready_to_tour":
      return "Ready to tour";
    case "application_review":
      return "Application review";
    case "pricing_updated":
      return "Pricing updated";
    case "leased":
      return "Leased";
  }
}

export function pricingLabel(fit: PipelineUnit["pricing"]): string {
  if (fit === "market_fit") return "Market fit";
  if (fit === "under") return "Under market";
  return "Over market";
}

export function channelLabel(channel: LeadChannel): string {
  if (channel === "sms") return "SMS";
  if (channel === "facebook") return "Facebook";
  return "Web";
}

export function listingPricing(listingId: string): PipelineUnit["pricing"] {
  return PIPELINE_UNITS.find((row) => row.id === listingId)?.pricing ?? "market_fit";
}

export function listingSyndication(listingId: string): "live" | "pending" {
  return listingId === FEATURED_LISTING_ID ? "live" : "pending";
}

export function pipelineUnitById(id: string): PipelineUnit | undefined {
  return PIPELINE_UNITS.find((row) => row.id === id);
}

export { mockProperties };
