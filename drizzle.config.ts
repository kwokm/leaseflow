import { defineConfig } from "drizzle-kit";

/**
 * Migrations are generated locally and committed under drizzle/. Run
 * `npm run db:migrate` against a Neon branch — never point this at production
 * without reviewing the generated SQL first.
 */
export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
  strict: true,
  verbose: true,
});
