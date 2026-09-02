/**
 * Applies everything in drizzle/ to DATABASE_URL.
 *
 * This runs as part of `npm run build` because nothing else ever did: the
 * migrations were committed but only applied by hand, so a deploy against a
 * fresh Neon database served an app whose tables did not exist. Every page that
 * queried Neon — the desk layout and the apply page — then threw
 * `relation "..." does not exist` and fell through to the error boundary.
 *
 * Without DATABASE_URL this is a no-op, so a checkout with no secrets still
 * builds. With DATABASE_URL it is fatal on failure: shipping an app against a
 * schema it cannot use is worse than stopping the deploy.
 */

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { migrate } from "drizzle-orm/neon-http/migrator";

const url = process.env.DATABASE_URL;

if (!url) {
  console.log("[migrate] DATABASE_URL is not set — skipping migrations.");
  process.exit(0);
}

try {
  await migrate(drizzle(neon(url)), { migrationsFolder: "./drizzle" });
  console.log("[migrate] Schema is up to date.");
} catch (error) {
  // Never log the connection string — it carries the password.
  console.error(
    "[migrate] Could not apply migrations. Stopping the build rather than " +
      "serving the app against a database it cannot read."
  );
  console.error(error);
  process.exit(1);
}
