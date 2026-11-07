import { withSentryConfig } from "@sentry/nextjs/config";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    // Enables forbidden() / unauthorized() for DAL role checks.
    authInterrupts: true,
  },
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  // Source maps upload only when SENTRY_AUTH_TOKEN is set (Vercel builds).
  silent: !process.env.CI,
  widenClientFileUpload: true,
  // Route browser events through our domain so ad blockers don't drop them.
  tunnelRoute: "/monitoring",
});
