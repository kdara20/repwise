"use client";

import { Button } from "@/components/ui/button";

export function ThrowButton() {
  return (
    <Button
      variant="destructive"
      onClick={() => {
        throw new Error(`Sentry client test error (${new Date().toISOString()})`);
      }}
    >
      Throw client error
    </Button>
  );
}
