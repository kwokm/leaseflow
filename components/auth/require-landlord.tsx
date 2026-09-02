"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import {
  MOCK_GOOGLE_LANDLORD,
  getLandlordSession,
  signInLandlord,
  subscribeLandlordSession,
} from "@/lib/auth/landlord";
import { PageWash } from "@/components/page-wash";

function useLandlordSession() {
  return useSyncExternalStore(subscribeLandlordSession, getLandlordSession, () => null);
}

export function RequireLandlord({ children }: { children: React.ReactNode }) {
  const session = useLandlordSession();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready || session) return;
    signInLandlord(MOCK_GOOGLE_LANDLORD, "google");
  }, [ready, session]);

  if (!ready || !session) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-white">
        <PageWash />
        <p className="relative z-10 px-5 pt-24 text-center text-[14px] font-medium text-mute">
          Opening the desk…
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
