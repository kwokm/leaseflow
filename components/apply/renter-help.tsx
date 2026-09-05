import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BetaContactLink } from "@/components/legal/beta-contact";

/** Renter-facing recovery: home + ask the landlord. Not a landlord-desk CTA. */
export function RenterHelpActions() {
  return (
    <div className="mt-6 flex flex-col items-center gap-3">
      <div className="flex flex-wrap justify-center gap-2">
        <Button asChild>
          <Link href="/">Back to Leaseproof</Link>
        </Button>
      </div>
      <p className="max-w-md text-[14px] font-medium leading-5 text-mute">
        Ask your landlord to resend the link. If you need help reaching them, email{" "}
        <BetaContactLink className="text-ink underline underline-offset-4" />.
      </p>
    </div>
  );
}
