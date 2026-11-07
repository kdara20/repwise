import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local", quiet: true });

// Migrations run on the `dev` Neon branch first (`neon checkout dev`).
// Production is only migrated on purpose: ALLOW_PRODUCTION_MIGRATION=1.
const branch = process.env.NEON_BRANCH;
const writesToDb = process.argv.some((arg) => /^(migrate|push)$/.test(arg));

if (writesToDb && !branch) {
  throw new Error(
    "NEON_BRANCH is not set. Run `neon checkout dev` so .env.local targets the dev branch.",
  );
}

if (writesToDb && branch === "production" && process.env.ALLOW_PRODUCTION_MIGRATION !== "1") {
  throw new Error(
    "Refusing to migrate the production branch. Run `neon checkout dev` and migrate there first. " +
      "To apply a migration already tested on dev, set ALLOW_PRODUCTION_MIGRATION=1.",
  );
}

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  // Migrations need a direct (non-pooled) connection.
  dbCredentials: { url: process.env.DATABASE_URL_UNPOOLED! },
});
