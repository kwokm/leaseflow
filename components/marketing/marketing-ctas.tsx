import Link from "next/link";
import { Button } from "@/components/ui/button";
import { applyAsRenterHref } from "@/lib/apply/public-cta";
import { LANDLORD_SIGN_IN_HREF } from "@/lib/auth/roles";
import { isDemoMode } from "@/lib/config/env";

export function MarketingCtas() {
  const applyHref = applyAsRenterHref(isDemoMode());

  return (
    <div className="flex flex-wrap gap-2.5">
      <Button asChild variant="lilac" size="cta">
        <Link href={LANDLORD_SIGN_IN_HREF}>Screen as Landlord</Link>
      </Button>
      <Button asChild variant="outline" size="cta">
        <Link href={applyHref}>Apply as renter</Link>
      </Button>
    </div>
  );
}
