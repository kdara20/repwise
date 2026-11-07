import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { debugRoutesEnabled } from "@/lib/debug";
import { ThrowButton } from "./throw-button";

export const metadata: Metadata = { title: "Sentry check", robots: { index: false } };

export default function SentryDebugPage() {
  if (!debugRoutesEnabled) notFound();

  return (
    <main className="mx-auto flex max-w-md grow flex-col items-start justify-center gap-4 p-4">
      <h1 className="font-heading text-2xl font-semibold">Sentry check</h1>
      <p className="text-muted-foreground">
        Sends a test error from the browser. Server errors:{" "}
        <code className="font-mono text-sm">/api/debug/sentry</code>.
      </p>
      <ThrowButton />
    </main>
  );
}
