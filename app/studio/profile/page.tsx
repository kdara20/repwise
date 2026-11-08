import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { requireUser } from "@/lib/dal/session";
import { ProfileForm } from "./profile-form";

export const metadata: Metadata = { title: "Your trainer profile", robots: { index: false } };

export default function StudioProfilePage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10">
      <header className="flex flex-col gap-1">
        <p className="text-sm font-medium text-muted-foreground">Studio</p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Your trainer profile</h1>
      </header>
      <Suspense fallback={<Skeleton className="h-[40rem] w-full" />}>
        <ProfileEditor />
      </Suspense>
    </main>
  );
}

async function ProfileEditor() {
  const { trainer } = await requireUser();
  // Not a trainer (yet): the application flow is the way in.
  if (!trainer) redirect("/apply");

  return (
    <ProfileForm
      trainer={{
        displayName: trainer.displayName,
        slug: trainer.slug,
        headline: trainer.headline,
        bio: trainer.bio,
        specialties: trainer.specialties,
        yearsExperience: trainer.yearsExperience,
        city: trainer.city,
        province: trainer.province,
        acceptingClients: trainer.acceptingClients,
        published: trainer.published,
      }}
    />
  );
}
