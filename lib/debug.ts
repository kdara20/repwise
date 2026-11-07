/** Debug-only routes (Sentry checks) are disabled on the production deployment. */
export const debugRoutesEnabled = process.env.VERCEL_ENV !== "production";
