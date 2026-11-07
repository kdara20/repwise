import "server-only";
import { createNeonAuth } from "@neon/auth/next/server";

import { env } from "@/lib/env";

/** Neon Auth (beta). All auth calls go through this module so it can be swapped. */
export const auth = createNeonAuth({
  baseUrl: env.NEON_AUTH_BASE_URL,
  cookies: { secret: env.NEON_AUTH_COOKIE_SECRET },
});
