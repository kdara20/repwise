import { spawnSync } from "node:child_process";

import { E2E_EMAIL_PREFIX, withDb } from "./helpers";

/**
 * Removes every E2E user: app rows via SQL, auth users via the Neon CLI
 * (the neon_auth schema is managed by Neon, so we don't delete from it directly).
 */
export default async function globalTeardown() {
  const ids = await withDb(async (db) => {
    const { rows } = await db.query<{ id: string }>(
      `select id from neon_auth."user" where email like $1`,
      [`${E2E_EMAIL_PREFIX}%`],
    );
    const userIds = rows.map((r) => r.id);
    if (userIds.length) {
      await db.query("delete from trainers where user_id = any($1)", [userIds]);
      await db.query("delete from trainer_applications where user_id = any($1)", [userIds]);
      await db.query("delete from profiles where user_id = any($1)", [userIds]);
    }
    return userIds;
  });

  let failed = 0;
  for (const id of ids) {
    const branch = process.env.NEON_BRANCH ?? "dev";
    const r = spawnSync("neon", ["neon-auth", "user", "delete", id, "--branch", branch], {
      shell: process.platform === "win32",
      encoding: "utf8",
    });
    if (r.status !== 0) failed++;
  }
  console.log(
    `[e2e teardown] removed ${ids.length} test user(s)` +
      (failed ? `; ${failed} auth user(s) need manual cleanup (is the neon CLI logged in?)` : ""),
  );
}
