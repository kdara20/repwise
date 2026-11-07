import "server-only";
import { attachDatabasePool } from "@vercel/functions";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { env } from "@/lib/env";
import * as schema from "./schema";

// node-postgres over Neon's pooled URL; on Vercel Fluid compute the pool is
// reused across requests and idle clients are released before suspension.
const pool = new Pool({ connectionString: env.DATABASE_URL });
attachDatabasePool(pool);

export const db = drizzle({ client: pool, schema });
