import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { requireUser } from "@/lib/dal/session";

export const metadata: Metadata = { title: "Dashboard", robots: { index: false } };

export default function DashboardPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10">
      <Suspense fallback={<Skeleton className="h-9 w-64" />}>
        <Greeting />
      </Suspense>
      <section className="rounded-xl border p-6">
        <h2 className="font-heading text-lg font-medium">Find your coach</h2>
        <p className="mt-1 text-muted-foreground">
          Browse vetted trainers across Canada.
        </p>
        <Link href="/trainers" className={buttonVariants({ className: "mt-4" })}>
          Browse trainers
        </Link>
      </section>
    </main>
  );
}

async function Greeting() {
  const { profile } = await requireUser();
  return (
    <h1 className="font-heading text-3xl font-semibold tracking-tight">
      Welcome, {profile.displayName}
    </h1>
  );
}
