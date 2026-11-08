import { InboxIcon } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SPECIALTY_LABELS, type Specialty } from "@/lib/constants";
import { listPendingApplications } from "@/lib/data/applications";
import { requireAdmin } from "@/lib/dal/session";
import { ReviewActions } from "./review-actions";

export const metadata: Metadata = { title: "Trainer applications", robots: { index: false } };

export default function AdminApplicationsPage() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-10">
      <h1 className="font-heading text-3xl font-semibold tracking-tight">Trainer applications</h1>
      <Suspense fallback={<Skeleton className="h-64 w-full" />}>
        <ApplicationList />
      </Suspense>
    </main>
  );
}

async function ApplicationList() {
  await requireAdmin();
  const applications = await listPendingApplications();

  if (applications.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed p-12 text-center">
        <InboxIcon className="size-8 text-muted-foreground" />
        <p className="font-medium">No pending applications</p>
        <p className="text-sm text-muted-foreground">New applications will show up here.</p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-4" aria-label="Pending applications">
      {applications.map((app) => (
        <li key={app.id}>
          <Card>
            <CardHeader>
              <CardTitle>{app.applicantName}</CardTitle>
              <CardDescription>
                {app.headline} · applied{" "}
                {app.createdAt.toLocaleDateString("en-CA", { dateStyle: "medium" })}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-1.5">
                {app.specialties.map((s) => (
                  <Badge key={s} variant="secondary">
                    {SPECIALTY_LABELS[s as Specialty] ?? s}
                  </Badge>
                ))}
              </div>
              <p className="whitespace-pre-line text-sm">{app.bio}</p>
              <div>
                <h3 className="text-sm font-medium">Certifications</h3>
                <p className="whitespace-pre-line text-sm text-muted-foreground">
                  {app.certifications}
                </p>
              </div>
              <ReviewActions id={app.id} applicant={app.applicantName} />
            </CardContent>
          </Card>
        </li>
      ))}
    </ul>
  );
}
