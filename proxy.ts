import { auth } from "@/lib/auth/server";

// Optimistic redirect for signed-out users only. Every page and action still
// authorizes through lib/dal.
export default auth.middleware({
  loginUrl: "/auth/sign-in",
  // /debug + /api/debug return 404 on the production deployment.
  publicRoutes: ["/", "/trainers", "/api/health", "/debug", "/api/debug"],
});

export const config = {
  matcher: [
    // Skips static assets, metadata files, the Sentry tunnel, and Vercel's
    // own /_vercel/* scripts (Analytics) so they're never redirected to sign-in.
    "/((?!_next/static|_next/image|_vercel|favicon.ico|sitemap.xml|robots.txt|monitoring).*)",
  ],
};
