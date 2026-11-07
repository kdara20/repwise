import { connection } from "next/server";

import { debugRoutesEnabled } from "@/lib/debug";

/** Throws on purpose so a server error can be traced end to end in Sentry. */
export async function GET() {
  await connection();
  if (!debugRoutesEnabled) return new Response("Not found", { status: 404 });
  throw new Error(`Sentry server test error (${new Date().toISOString()})`);
}
