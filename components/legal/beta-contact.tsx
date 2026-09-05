import { BETA_CONTACT_EMAIL, BETA_CONTACT_HREF } from "@/lib/auth/beta-allowlist";

export function BetaContactLink({ className }: { className?: string }) {
  return (
    <a href={BETA_CONTACT_HREF} className={className}>
      {BETA_CONTACT_EMAIL}
    </a>
  );
}
