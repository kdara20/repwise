import { ClockIcon } from "lucide-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { getLatestApplication } from "@/lib/data/applications";
import { requireUser } from "@/lib/dal/session";
import { ApplyForm } from "./apply-form";

export const metadata: Metadata = {
  title: "Become a trainer",
  description: "Apply to coach clients on Repwise.",
};

export default function ApplyPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-10">
      <header className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Become a trainer</h1>
        <p className="text-muted-foreground">
          Tell us about your coaching. Every application is reviewed by our team, usually
          within a few business days.
        </p>
      </header>
      <Suspense fallback={<Skeleton className="h-96 w-full" />}>
        <ApplyContent />
      </Suspense>
    </main>
  );
}

async function ApplyContent() {
  const viewer = await requireUser();
  if (viewer.trainer) redirect("/studio/profile");

  const latest = await getLatestApplication(viewer.user.id);

  if (latest?.status === "pending") {
    return (
      <Alert>
        <ClockIcon />
        <AlertTitle>Application under review</AlertTitle>
        <AlertDescription>
          Submitted {latest.createdAt.toLocaleDateString("en-CA", { dateStyle: "long" })}.
          We&apos;ll update your dashboard once it&apos;s been reviewed.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <>
      {latest?.status === "rejected" && (
        <Alert variant="destructive">
          <AlertTitle>Your previous application wasn&apos;t approved</AlertTitle>
          <AlertDescription>
            {latest.rejectionReason ?? "No reason given."} You&apos;re welcome to apply again.
          </AlertDescription>
        </Alert>
      )}
      <ApplyForm
        previous={
          latest && {
            headline: latest.headline,
            bio: latest.bio,
            specialties: latest.specialties,
            certifications: latest.certifications,
          }
        }
      />
    </>
  );
}
