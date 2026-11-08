import { config } from "dotenv";
import { defineConfig, devices } from "@playwright/test";

config({ path: ".env.local", quiet: true });

// E2E creates and deletes real users, so it must never touch production.
if (process.env.NEON_BRANCH === "production") {
  throw new Error("E2E must not run against the production Neon branch. Run `neon checkout dev`.");
}

const PORT = 3100;

export default defineConfig({
  testDir: "./e2e",
  // Tests share one database and the flow test is ordered; keep it simple.
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? "github" : "list",
  globalTeardown: "./e2e/global-teardown.ts",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    // Run `npm run build` first; E2E tests the production server.
    command: `npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}/api/health`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
