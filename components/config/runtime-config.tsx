"use client";

import { createContext, useContext } from "react";
import type { RuntimeConfig } from "@/lib/config/env";

/**
 * The demo flag lives in a server-only env var (LEASEPROOF_DEMO) so it cannot
 * be flipped from the browser. The root layout reads it once and passes this
 * snapshot down; client components read it from context rather than env.
 */
const FALLBACK: RuntimeConfig = {
  demo: false,
  clerk: false,
  database: false,
  stripe: false,
  blob: false,
  liveFees: false,
  stripeLive: false,
  social: { instagram: false, tiktok: false, facebook: false },
};

const RuntimeConfigContext = createContext<RuntimeConfig>(FALLBACK);

export function RuntimeConfigProvider({
  value,
  children,
}: {
  value: RuntimeConfig;
  children: React.ReactNode;
}) {
  return (
    <RuntimeConfigContext.Provider value={value}>{children}</RuntimeConfigContext.Provider>
  );
}

export function useRuntimeConfig(): RuntimeConfig {
  return useContext(RuntimeConfigContext);
}
