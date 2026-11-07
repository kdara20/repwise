import "server-only";
import * as Sentry from "@sentry/nextjs";
import { eq } from "drizzle-orm";
import { forbidden, redirect } from "next/navigation";
import { connection } from "next/server";
import { cache } from "react";

import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { profiles, trainers, type Profile, type Trainer } from "@/lib/db/schema";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  image: string | null;
};

export type Viewer = {
  user: SessionUser;
  profile: Profile;
  trainer: Trainer | null;
};

/** The signed-in user, or null. Memoized per request. */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  // Stop prerendering here instead of leaving the SDK's cookie read hanging.
  await connection();
  const { data } = await auth.getSession();
  if (!data?.user) return null;
  const { id, name, email, image } = data.user;
  // Id only — no email or name in Sentry.
  Sentry.setUser({ id });
  return { id, name: name || email, email, image: image ?? null };
});

/**
 * The signed-in user with their profile and (approved) trainer record.
 * Creates the profile row on first sign-in.
 */
export const getViewer = cache(async (): Promise<Viewer | null> => {
  const user = await getSessionUser();
  if (!user) return null;

  let profile = await db.query.profiles.findFirst({
    where: eq(profiles.userId, user.id),
  });

  if (!profile) {
    [profile] = await db
      .insert(profiles)
      .values({ userId: user.id, displayName: user.name, imageUrl: user.image })
      .onConflictDoUpdate({
        target: profiles.userId,
        set: { userId: user.id },
      })
      .returning();
  }

  if (profile.deletedAt) return null;

  const trainer =
    (await db.query.trainers.findFirst({
      where: eq(trainers.userId, user.id),
    })) ?? null;

  return {
    user,
    profile,
    trainer: trainer?.status === "approved" ? trainer : null,
  };
});

export async function requireUser(): Promise<Viewer> {
  const viewer = await getViewer();
  if (!viewer) redirect("/auth/sign-in");
  return viewer;
}

export async function requireTrainer(): Promise<Viewer & { trainer: Trainer }> {
  const viewer = await requireUser();
  if (!viewer.trainer) forbidden();
  return viewer as Viewer & { trainer: Trainer };
}

export async function requireAdmin(): Promise<Viewer> {
  const viewer = await requireUser();
  if (!viewer.profile.isAdmin) forbidden();
  return viewer;
}
