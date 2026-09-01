"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Field } from "@/components/apply/field";
import { PacketWindow } from "@/components/desk/packet-window";
import { GoogleMark } from "@/components/auth/google-mark";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  MOCK_GOOGLE_LANDLORD,
  getLandlordProfile,
  getLandlordSession,
  safeDeskNext,
  signInLandlord,
  subscribeLandlordSession,
  type LandlordProfile,
} from "@/lib/auth/landlord";

type Mode = "signin" | "create";
type Stage = "email" | "profile";

const EMPTY_PROFILE: LandlordProfile = {
  email: "",
  firstName: "",
  lastName: "",
  phone: "",
  company: "",
};

function useLandlordSession() {
  return useSyncExternalStore(subscribeLandlordSession, getLandlordSession, () => null);
}

function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function LandlordAuth() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const session = useLandlordSession();
  const next = useMemo(() => safeDeskNext(searchParams.get("next")), [searchParams]);
  const requestedMode = searchParams.get("mode") === "create" ? "create" : "signin";

  const [ready, setReady] = useState(false);
  const [mode, setMode] = useState<Mode>(requestedMode);
  const [stage, setStage] = useState<Stage>("email");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState(EMPTY_PROFILE);
  const [errors, setErrors] = useState<Partial<Record<keyof LandlordProfile, string>>>({});
  const [note, setNote] = useState("");

  useEffect(() => {
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready && session?.email) {
      router.replace(next);
    }
  }, [next, ready, router, session?.email]);

  function patch(partial: Partial<LandlordProfile>) {
    setForm((current) => ({ ...current, ...partial }));
  }

  function finish(profile: LandlordProfile, provider: "google" | "email") {
    setBusy(true);
    signInLandlord(profile, provider);
    router.replace(next);
  }

  function continueWithGoogle() {
    finish(MOCK_GOOGLE_LANDLORD, "google");
  }

  function continueWithEmail(event: React.FormEvent) {
    event.preventDefault();
    const email = form.email.trim().toLowerCase();
    if (!validEmail(email)) {
      setErrors({ email: "Enter a valid email." });
      return;
    }
    setErrors({});
    const existing = getLandlordProfile(email);

    if (mode === "signin" && existing) {
      finish(existing, "email");
      return;
    }

    if (mode === "signin" && !existing) {
      setMode("create");
      setNote("No desk for that email yet — add a few details to create one.");
    } else {
      setNote("");
    }

    if (existing) {
      setForm({ ...existing, email });
    } else {
      patch({ email });
    }
    setStage("profile");
  }

  function submitProfile(event: React.FormEvent) {
    event.preventDefault();
    const nextErrors: Partial<Record<keyof LandlordProfile, string>> = {};
    if (!form.firstName.trim()) nextErrors.firstName = "First name is required.";
    if (!form.lastName.trim()) nextErrors.lastName = "Last name is required.";
    if (!form.phone.trim()) nextErrors.phone = "Phone is required.";
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }
    finish(
      {
        email: form.email.trim().toLowerCase(),
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phone: form.phone.trim(),
        company: form.company.trim(),
      },
      "email"
    );
  }

  const title = mode === "create" ? "Create your landlord desk" : "Sign in to your landlord desk";

  return (
    <PacketWindow
      title="Landlord desk"
      meta={mode === "create" ? "Create account" : "Sign in"}
    >
      <div className="px-6 py-7 sm:px-8">
        <div className="mb-5 flex items-center gap-3 text-[13px] font-medium tracking-[-0.13px]">
          <button
            type="button"
            className={cn(
              "transition-colors duration-200 ease-out",
              mode === "signin" ? "text-ink" : "text-mute hover:text-ink"
            )}
            onClick={() => {
              setMode("signin");
              setStage("email");
              setNote("");
              setErrors({});
            }}
          >
            Sign in
          </button>
          <span className="text-mute-3" aria-hidden>
            /
          </span>
          <button
            type="button"
            className={cn(
              "transition-colors duration-200 ease-out",
              mode === "create" ? "text-ink" : "text-mute hover:text-ink"
            )}
            onClick={() => {
              setMode("create");
              setStage("email");
              setNote("");
              setErrors({});
            }}
          >
            Create account
          </button>
        </div>

        <h1 className="text-[24px] font-semibold leading-[1.15] tracking-[-0.4px] text-ink">
          {title}
        </h1>
        <p className="mt-2 max-w-md text-[14px] font-medium leading-5 text-mute">
          Prototype sign-in. Google is mocked — no OAuth, no keys. After you continue, the realtor
          desk opens in this browser.
        </p>

        <div className="mt-6 space-y-4">
          <Button
            type="button"
            size="touch"
            className="w-full bg-[#4285F4] text-white border-[#4285F4] hover:bg-[#3367d6]"
            onClick={continueWithGoogle}
            disabled={busy}
          >
            <GoogleMark />
            Continue with Google
          </Button>

          <div className="flex items-center gap-3 text-[12px] font-medium text-mute-2">
            <span className="h-px flex-1 bg-line" />
            or continue with email
            <span className="h-px flex-1 bg-line" />
          </div>

          {stage === "email" ? (
            <form onSubmit={continueWithEmail} className="space-y-4">
              <Field
                id="landlord-email"
                label="Email"
                type="email"
                autoComplete="email"
                value={form.email}
                error={errors.email}
                onChange={(event) => patch({ email: event.target.value })}
              />
              <Button type="submit" variant="lilac" size="touch" className="w-full" disabled={busy}>
                Continue
              </Button>
            </form>
          ) : (
            <form onSubmit={submitProfile} className="space-y-4">
              {note ? (
                <p className="text-[13px] font-medium leading-5 text-mute">{note}</p>
              ) : (
                <p className="text-[13px] font-medium leading-5 text-mute">
                  A few details so the desk knows who you are. Company or brokerage is optional.
                </p>
              )}
              <Field
                id="landlord-email-locked"
                label="Email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(event) => patch({ email: event.target.value })}
              />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field
                  id="landlord-first"
                  label="First name"
                  autoComplete="given-name"
                  value={form.firstName}
                  error={errors.firstName}
                  onChange={(event) => patch({ firstName: event.target.value })}
                />
                <Field
                  id="landlord-last"
                  label="Last name"
                  autoComplete="family-name"
                  value={form.lastName}
                  error={errors.lastName}
                  onChange={(event) => patch({ lastName: event.target.value })}
                />
              </div>
              <Field
                id="landlord-phone"
                label="Phone"
                type="tel"
                autoComplete="tel"
                value={form.phone}
                error={errors.phone}
                onChange={(event) => patch({ phone: event.target.value })}
              />
              <Field
                id="landlord-company"
                label="Company / brokerage"
                hint="Optional"
                autoComplete="organization"
                value={form.company}
                onChange={(event) => patch({ company: event.target.value })}
              />
              <Button type="submit" variant="lilac" size="touch" className="w-full" disabled={busy}>
                Continue to desk
              </Button>
              <button
                type="button"
                className="w-full text-center text-[13px] font-medium text-mute hover:text-ink"
                onClick={() => {
                  setStage("email");
                  setErrors({});
                }}
              >
                Use a different email
              </button>
            </form>
          )}
        </div>
      </div>
    </PacketWindow>
  );
}
