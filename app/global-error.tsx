"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui", padding: 48, textAlign: "center" }}>
        <h1>Something went wrong</h1>
        <p>We&apos;ve been notified and are looking into it.</p>
        {/* Full reload on purpose: the client router may be what broke. */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href="/">Go home</a>
      </body>
    </html>
  );
}
