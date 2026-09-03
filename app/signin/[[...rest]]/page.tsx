import { SignIn } from "@clerk/nextjs";
import { AuthShell, AuthUnconfigured } from "@/components/auth/auth-shell";
import { clerkEnabled, isDemoMode } from "@/lib/config/env";
import { safeDeskNext } from "@/lib/auth/roles";

export const metadata = {
  title: "Sign in — Leaseproof",
  description: "Sign in to your Leaseproof landlord desk or renter account.",
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; role?: string }>;
}) {
  const { next, role } = await searchParams;

  if (!clerkEnabled()) {
    return (
      <AuthShell meta="Sign in">
        <AuthUnconfigured demo={isDemoMode()} />
      </AuthShell>
    );
  }

  // Renters land back on the listing they were applying to; landlords fall
  // through to the desk. `safeDeskNext` keeps `?next=` from opening a redirect.
  const redirectUrl = safeDeskNext(next);

  return (
    <AuthShell meta="Sign in">
      <h1 className="mb-1 text-[24px] font-semibold leading-[1.15] tracking-[-0.4px] text-ink">
        {role === "renter" ? "Sign in to apply" : "Sign in to your landlord desk"}
      </h1>
      <p className="mb-6 text-[14px] font-medium leading-5 text-mute">
        {role === "renter"
          ? "Continue with Google or your email address."
          : "Orange County private beta. Continue with Google or the email you were invited with."}
      </p>
      <SignIn
        routing="path"
        path="/signin"
        signUpUrl={role === "renter" ? "/signup?role=renter" : "/signup"}
        fallbackRedirectUrl={redirectUrl}
      />
    </AuthShell>
  );
}
