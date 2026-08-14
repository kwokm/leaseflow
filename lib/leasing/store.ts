"use client";

import { useSyncExternalStore } from "react";
import { FEATURED_LISTING_ID } from "@/lib/data/mock-data";

const LEASE_KEY = "leaseflow:leases.v1";
const SHOWING_KEY = "leaseflow:showings.v1";
const ENHANCE_KEY = "leaseflow:enhance.v1";

export type LeaseStatus = "draft" | "pending_sign" | "signed" | "deposit_queued";

export type GeneratedLease = {
  id: string;
  applicationId: string;
  listingId: string;
  tenantName: string;
  address: string;
  rent: number;
  deposit: number;
  startDate: string;
  status: LeaseStatus;
  createdAt: string;
  signedAt?: string;
};

export type BookedShowing = {
  id: string;
  listingId: string;
  slot: string;
  name: string;
  email: string;
  createdAt: string;
};

type LeaseMap = Record<string, GeneratedLease>;
type ShowingList = BookedShowing[];
type EnhanceMap = Record<string, boolean>;

function readLeases(): LeaseMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(LEASE_KEY);
    return raw ? (JSON.parse(raw) as LeaseMap) : {};
  } catch {
    return {};
  }
}

function writeLeases(map: LeaseMap) {
  localStorage.setItem(LEASE_KEY, JSON.stringify(map));
}

function readShowings(): ShowingList {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SHOWING_KEY);
    return raw ? (JSON.parse(raw) as ShowingList) : [];
  } catch {
    return [];
  }
}

function writeShowings(list: ShowingList) {
  localStorage.setItem(SHOWING_KEY, JSON.stringify(list));
}

function readEnhance(): EnhanceMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(ENHANCE_KEY);
    return raw ? (JSON.parse(raw) as EnhanceMap) : {};
  } catch {
    return {};
  }
}

function writeEnhance(map: EnhanceMap) {
  localStorage.setItem(ENHANCE_KEY, JSON.stringify(map));
}

const leaseListeners = new Set<() => void>();
const showingListeners = new Set<() => void>();
const enhanceListeners = new Set<() => void>();

function emitLeases() {
  leaseListeners.forEach((l) => l());
}
function emitShowings() {
  showingListeners.forEach((l) => l());
}
function emitEnhance() {
  enhanceListeners.forEach((l) => l());
}

export function queueLease(input: {
  applicationId: string;
  listingId: string;
  tenantName: string;
  address: string;
  rent: number;
}): GeneratedLease {
  const map = readLeases();
  const existing = Object.values(map).find((l) => l.applicationId === input.applicationId);
  if (existing) return existing;
  const lease: GeneratedLease = {
    id: `lease-${input.applicationId}`,
    applicationId: input.applicationId,
    listingId: input.listingId,
    tenantName: input.tenantName,
    address: input.address,
    rent: input.rent,
    deposit: input.rent,
    startDate: "September 1, 2026",
    status: "pending_sign",
    createdAt: new Date().toISOString(),
  };
  map[lease.id] = lease;
  writeLeases(map);
  emitLeases();
  return lease;
}

export function signLease(id: string) {
  const map = readLeases();
  const lease = map[id];
  if (!lease) return;
  map[id] = {
    ...lease,
    status: "deposit_queued",
    signedAt: new Date().toISOString(),
  };
  writeLeases(map);
  emitLeases();
}

export function getLease(id: string): GeneratedLease | undefined {
  return readLeases()[id];
}

export function getLeaseByApplication(applicationId: string): GeneratedLease | undefined {
  return Object.values(readLeases()).find((l) => l.applicationId === applicationId);
}

export function listLeases(): GeneratedLease[] {
  return Object.values(readLeases()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function bookShowing(input: { listingId?: string; name: string; email: string; slot?: string }): BookedShowing {
  const list = readShowings();
  const showing: BookedShowing = {
    id: `show-${Date.now()}`,
    listingId: input.listingId ?? FEATURED_LISTING_ID,
    slot: input.slot ?? "Tuesday, Aug 18 · 2:00 PM",
    name: input.name,
    email: input.email,
    createdAt: new Date().toISOString(),
  };
  list.push(showing);
  writeShowings(list);
  emitShowings();
  return showing;
}

export function listShowings(): BookedShowing[] {
  return readShowings();
}

export function isEnhanced(listingId: string): boolean {
  return Boolean(readEnhance()[listingId]);
}

export function setEnhanced(listingId: string, on: boolean) {
  const map = readEnhance();
  map[listingId] = on;
  writeEnhance(map);
  emitEnhance();
}

export function useLeases() {
  return useSyncExternalStore(
    (cb) => {
      leaseListeners.add(cb);
      return () => leaseListeners.delete(cb);
    },
    listLeases,
    () => [],
  );
}

export function useLease(id: string | undefined) {
  return useSyncExternalStore(
    (cb) => {
      leaseListeners.add(cb);
      return () => leaseListeners.delete(cb);
    },
    () => (id ? getLease(id) : undefined),
    () => undefined,
  );
}

export function useLeaseByApplication(applicationId: string | undefined) {
  return useSyncExternalStore(
    (cb) => {
      leaseListeners.add(cb);
      return () => leaseListeners.delete(cb);
    },
    () => (applicationId ? getLeaseByApplication(applicationId) : undefined),
    () => undefined,
  );
}

export function useBookedShowings() {
  return useSyncExternalStore(
    (cb) => {
      showingListeners.add(cb);
      return () => showingListeners.delete(cb);
    },
    listShowings,
    () => [],
  );
}

export function leaseStatusLabel(status: LeaseStatus): string {
  switch (status) {
    case "draft":
      return "Draft";
    case "pending_sign":
      return "E-sign pending";
    case "signed":
      return "Signed";
    case "deposit_queued":
      return "Deposit queued";
  }
}

export function useEnhanced(listingId: string) {
  return useSyncExternalStore(
    (cb) => {
      enhanceListeners.add(cb);
      return () => enhanceListeners.delete(cb);
    },
    () => isEnhanced(listingId),
    () => false,
  );
}
