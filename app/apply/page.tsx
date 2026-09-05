import type { Metadata } from "next";
import { NeedApplyLink } from "@/components/apply/need-apply-link";

export const metadata: Metadata = {
  title: "Apply — Leaseproof",
  description: "Ask your landlord for a Leaseproof apply link.",
};

export default function ApplyIndexPage() {
  return <NeedApplyLink />;
}
