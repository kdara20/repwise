"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <main className="mx-auto flex max-w-md grow flex-col items-center justify-center gap-4 p-4 text-center">
      <h1 className="font-heading text-2xl font-semibold">Something went wrong</h1>
      <p className="text-muted-foreground">
        We&apos;ve been notified. Try again, or come back in a moment.
      </p>
      {error.digest && (
        <p className="font-mono text-xs text-muted-foreground">Ref: {error.digest}</p>
      )}
      <Button variant="outline" onClick={reset}>
        Try again
      </Button>
    </main>
  );
}
