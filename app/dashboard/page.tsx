import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { countPendingApplications, getLatestApplication } from "@/lib/data/applications";
import { requireUser, type Viewer } from "@/lib/dal/session";

export const metadata: Metadata = { title: "Dashboard", robots: { index: false } };

export default function DashboardPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10">
      <Suspense fallback={<DashboardSkeleton />}>
        <Dashboard />
      </Suspense>
    </main>
  );
}

async function Dashboard() {
  const viewer = await requireUser();

  return (
    <>
      <h1 className="font-heading text-3xl font-semibold tracking-tight">
        Welcome, {viewer.profile.displayName}
      </h1>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Find your coach</CardTitle>
            <CardDescription>Browse vetted trainers across Canada.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Link href="/trainers" className={buttonVariants()}>
              Browse trainers
            </Link>
          </CardFooter>
        </Card>
        <TrainerStatusCard viewer={viewer} />
        {viewer.profile.isAdmin && <AdminCard />}
      </div>
    </>
  );
}

async function TrainerStatusCard({ viewer }: { viewer: Viewer }) {
  if (viewer.trainer) {
    const { published, slug } = viewer.trainer;
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Your trainer profile
            <Badge variant={published ? "default" : "outline"}>{published ? "Live" : "Hidden"}</Badge>
          </CardTitle>
          <CardDescription>
            {published
              ? "Clients can find you in the directory."
              : "Finish your profile and publish it to appear in the directory."}
          </CardDescription>
        </CardHeader>
        <CardFooter className="gap-3">
          <Link href="/studio/profile" className={buttonVariants({ variant: "outline" })}>
            Edit profile
          </Link>
          {published && (
            <Link href={`/trainers/${slug}`} className="text-sm underline-offset-4 hover:underline">
              View public page
            </Link>
          )}
        </CardFooter>
      </Card>
    );
  }

  const latest = await getLatestApplication(viewer.user.id);
  const status = latest?.status;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Coach on Repwise
          {status === "pending" && <Badge variant="secondary">Under review</Badge>}
          {status === "rejected" && <Badge variant="destructive">Not approved</Badge>}
        </CardTitle>
        <CardDescription>
          {status === "pending"
            ? "Thanks for applying — we'll review your application soon."
            : status === "rejected"
              ? (latest?.rejectionReason ?? "Your application wasn't approved.")
              : "Certified trainer? Apply to list your services."}
        </CardDescription>
      </CardHeader>
      {status !== "pending" && (
        <CardFooter>
          <Link href="/apply" className={buttonVariants({ variant: "outline" })}>
            {status === "rejected" ? "Apply again" : "Become a trainer"}
          </Link>
        </CardFooter>
      )}
    </Card>
  );
}

async function AdminCard() {
  const pending = await countPendingApplications();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Admin
          {pending > 0 && <Badge>{pending} pending</Badge>}
        </CardTitle>
        <CardDescription>Review trainer applications.</CardDescription>
      </CardHeader>
      <CardFooter>
        <Link href="/admin/applications" className={buttonVariants({ variant: "outline" })}>
          Review applications
        </Link>
      </CardFooter>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <>
      <Skeleton className="h-9 w-64" />
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
      </div>
    </>
  );
}
