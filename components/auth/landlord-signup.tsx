"use client";

import { useState } from "react";
import { SignUp } from "@clerk/nextjs";
import { PRIVATE_BETA_MESSAGE } from "@/lib/auth/beta-allowlist";
import { safeDeskNext } from "@/lib/auth/roles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LandlordSignup({ next }: { next?: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"ask" | "checking" | "allowed" | "denied">("ask");
  const [message, setMessage] = useState<string | null>(null);

  const check = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus("checking");
    setMessage(null);

    try {
      const response = await fetch("/api/auth/beta-check", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const payload = (await response.json().catch(() => ({}))) as {
        allowed?: boolean;
        error?: string;
      };

      if (payload.allowed) {
        setStatus("allowed");
        return;
      }

      setStatus("denied");
      setMessage(payload.error ?? PRIVATE_BETA_MESSAGE);
    } catch {
      setStatus("denied");
      setMessage(PRIVATE_BETA_MESSAGE);
    }
  };

  if (status === "allowed") {
    return (
      <>
        <h1 className="mb-1 text-[24px] font-semibold leading-[1.15] tracking-[-0.4px] text-ink">
          Create your landlord desk
        </h1>
        <p className="mb-6 text-[14px] font-medium leading-5 text-mute">
          Continue with Google or your email — use {email}.
        </p>
        <SignUp
          routing="path"
          path="/signup"
          signInUrl="/signin"
          fallbackRedirectUrl={safeDeskNext(next)}
          initialValues={{ emailAddress: email }}
        />
      </>
    );
  }

  return (
    <>
      <h1 className="mb-1 text-[24px] font-semibold leading-[1.15] tracking-[-0.4px] text-ink">
        Create your landlord desk
      </h1>
      <p className="mb-6 text-[14px] font-medium leading-5 text-mute">
        Orange County private beta — invite-only. Enter the email you were invited
        with. Applicants do not need an invite; they open the apply link you send.
      </p>

      <form onSubmit={(event) => void check(event)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="beta-email">Invited email</Label>
          <Input
            id="beta-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              if (status === "denied") {
                setStatus("ask");
                setMessage(null);
              }
            }}
            placeholder="you@example.com"
          />
        </div>
        {message ? (
          <p role="alert" className="text-[14px] font-medium leading-5 text-ink">
            {message}
          </p>
        ) : null}
        <Button type="submit" disabled={status === "checking"}>
          {status === "checking" ? "Checking…" : "Continue"}
        </Button>
      </form>
    </>
  );
}
