import "server-only";
import { parseEnv } from "@neon/env";
import { z } from "zod";

import neonConfig from "@/neon";

// Neon-managed vars (pulled by `neon env pull`), validated against neon.ts.
const { postgres } = parseEnv(neonConfig, ["DATABASE_URL"]);

const schema = z.object({
  // parseEnv only checks presence; catch quoted/garbled values at build time.
  DATABASE_URL: z.url({ protocol: /^postgres(ql)?$/ }),
  NEON_AUTH_BASE_URL: z.url(),
  NEON_AUTH_COOKIE_SECRET: z.string().min(32),
  NEXT_PUBLIC_SITE_URL: z.url().default("http://localhost:3000"),
});

const parsed = schema.safeParse({ ...process.env, DATABASE_URL: postgres.databaseUrl });

if (!parsed.success) {
  throw new Error(
    `Invalid environment variables:\n${z.prettifyError(parsed.error)}`,
  );
}

export const env = parsed.data;
