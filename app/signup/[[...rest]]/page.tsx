import { SignUp } from "@clerk/nextjs";
import { AuthShell, AuthUnconfigured } from "@/components/auth/auth-shell";
import { LandlordSignup } from "@/components/auth/landlord-signup";
import { clerkEnabled, isDemoMode } from "@/lib/config/env";
import { safeDeskNext } from "@/lib/auth/roles";

export const metadata = {
  title: "Create your account — Leaseproof",
  description: "Create a Leaseproof landlord desk or renter account.",
};

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; role?: string }>;
}) {
  const { next, role } = await searchParams;

  if (!clerkEnabled()) {
    return (
      <AuthShell meta="Create account">
        <AuthUnconfigured demo={isDemoMode()} />
      </AuthShell>
    );
  }

  if (role === "renter") {
    return (
      <AuthShell meta="Create account">
        <h1 className="mb-1 text-[24px] font-semibold leading-[1.15] tracking-[-0.4px] text-ink">
          Create your renter account
        </h1>
        <p className="mb-6 text-[14px] font-medium leading-5 text-mute">
          Continue with Google or your email address. You do not need a beta
          invite to apply — use the link your landlord sent.
        </p>
        <SignUp
          routing="path"
          path="/signup"
          signInUrl="/signin?role=renter"
          fallbackRedirectUrl={safeDeskNext(next)}
        />
      </AuthShell>
    );
  }

  return (
    <AuthShell meta="Private beta">
      <LandlordSignup next={next} />
    </AuthShell>
  );
}
