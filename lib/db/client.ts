import "server-only";

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { databaseEnabled } from "@/lib/config/env";
import * as schema from "@/lib/db/schema";

export type Database = ReturnType<typeof create>;

function create() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  return drizzle(neon(url), { schema });
}

let cached: Database | undefined;

/**
 * Neon over HTTP — one round trip per query, which suits serverless route
 * handlers. Throws when unconfigured; call `getDb()` if you want to degrade.
 */
export function db(): Database {
  if (!cached) cached = create();
  return cached;
}

/**
 * Returns null instead of throwing when DATABASE_URL is absent, so preview
 * deployments and local click-throughs fall back to demo data.
 */
export function getDb(): Database | null {
  if (!databaseEnabled()) return null;
  return db();
}
