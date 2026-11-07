import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

export default function Forbidden() {
  return (
    <main className="mx-auto flex max-w-md grow flex-col items-center justify-center gap-4 p-4 text-center">
      <h1 className="font-heading text-2xl font-semibold">Access denied</h1>
      <p className="text-muted-foreground">
        You don&apos;t have permission to view this page.
      </p>
      <Link href="/dashboard" className={buttonVariants({ variant: "outline" })}>
        Back to dashboard
      </Link>
    </main>
  );
}
