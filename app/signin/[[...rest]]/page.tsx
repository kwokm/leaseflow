import Link from "next/link";
import { SignIn } from "@clerk/nextjs";
import { AuthShell, AuthUnconfigured } from "@/components/auth/auth-shell";
import { clerkEnabled, isDemoMode } from "@/lib/config/env";
import { deskSignUpHref, safeDeskNext } from "@/lib/auth/roles";

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
        <AuthUnconfigured demo={isDemoMode()} next={next} />
      </AuthShell>
    );
  }

  // Renters land back on the listing they were applying to; landlords fall
  // through to the desk. `safeDeskNext` keeps `?next=` from opening a redirect.
  const redirectUrl = safeDeskNext(next);

  return (
    <AuthShell meta="Sign in">
      <h1 className="mb-1 text-[24px] font-semibold leading-[1.15] tracking-[-0.4px] text-ink">
        {role === "renter" ? "Sign in to apply" : "Landlord desk"}
      </h1>
      <p className="mb-4 text-[14px] font-medium leading-5 text-mute">
        {role === "renter"
          ? "Continue with Google or your email address."
          : "Orange County private beta. Invited landlords without an account should create a desk first. If you already have one, continue below."}
      </p>
      {role !== "renter" ? (
        <p className="mb-6">
          <Link
            href={deskSignUpHref(next)}
            className="text-[14px] font-medium text-ink underline underline-offset-4"
          >
            Invited? Create your desk
          </Link>
        </p>
      ) : null}
      <SignIn
        routing="path"
        path="/signin"
        signUpUrl={role === "renter" ? "/signup?role=renter" : "/signup"}
        fallbackRedirectUrl={redirectUrl}
      />
    </AuthShell>
  );
}
