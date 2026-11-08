"use client";

import { getSafeRedirectTo } from "@better-auth-ui/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";

import { AuthProvider } from "@/components/auth/auth-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { authClient } from "@/lib/auth/client";

export function Providers({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [queryClient] = useState(() => new QueryClient());

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <QueryClientProvider client={queryClient}>
        <AuthProvider
          authClient={authClient}
          navigate={({ to, replace }) => {
            const path = getSafeRedirectTo(to, window.location.origin);
            // getSafeRedirectTo can still return protocol-relative paths.
            const target = path.startsWith("//") ? "/" : path;
            if (!target.startsWith("/auth/")) {
              // Leaving the auth views means the session just changed. The client
              // router may hold pages prefetched while signed out (e.g. a cached
              // redirect from /dashboard to sign-in), so load the page fresh.
              if (replace) window.location.replace(target);
              else window.location.assign(target);
              return;
            }
            // Between auth views (e.g. after sign-out): drop stale cached pages.
            router.refresh();
            if (replace) router.replace(target);
            else router.push(target);
          }}
          Link={Link}
          redirectTo="/dashboard"
          // Must match the branch's "Require Verification" (off). Verification
          // links need custom SMTP; turn on once Resend SMTP is configured.
          emailAndPassword={{ requireEmailVerification: false }}
        >
          <TooltipProvider>{children}</TooltipProvider>
          <Toaster />
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
