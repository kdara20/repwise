import { count, sql } from "drizzle-orm";
import { connection } from "next/server";

import { db } from "@/lib/db";
import { trainers } from "@/lib/db/schema";

/** Liveness + database check. Exposes no data beyond ok/latency. */
export async function GET() {
  await connection();
  const started = performance.now();
  try {
    await db.execute(sql`select 1`);
    // Touches an app table so a missing migration fails the check.
    await db.select({ n: count() }).from(trainers);
    return Response.json({
      ok: true,
      db: "up",
      latencyMs: Math.round(performance.now() - started),
    });
  } catch {
    return Response.json({ ok: false, db: "down" }, { status: 503 });
  }
}
