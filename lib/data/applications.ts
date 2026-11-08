import "server-only";
import { and, asc, desc, eq, like, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { profiles, trainerApplications, trainers, type TrainerApplication } from "@/lib/db/schema";
import { pickFreeSlug } from "@/lib/slug";

/** The user's most recent application (any status), or null. */
export async function getLatestApplication(userId: string): Promise<TrainerApplication | null> {
  const [row] = await db
    .select()
    .from(trainerApplications)
    .where(eq(trainerApplications.userId, userId))
    .orderBy(desc(trainerApplications.createdAt))
    .limit(1);
  return row ?? null;
}

export async function listPendingApplications() {
  return db
    .select({
      id: trainerApplications.id,
      headline: trainerApplications.headline,
      bio: trainerApplications.bio,
      specialties: trainerApplications.specialties,
      certifications: trainerApplications.certifications,
      createdAt: trainerApplications.createdAt,
      applicantName: profiles.displayName,
    })
    .from(trainerApplications)
    .innerJoin(profiles, eq(profiles.userId, trainerApplications.userId))
    .where(eq(trainerApplications.status, "pending"))
    .orderBy(asc(trainerApplications.createdAt));
}

export async function countPendingApplications(): Promise<number> {
  const [{ n }] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(trainerApplications)
    .where(eq(trainerApplications.status, "pending"));
  return n;
}

export class ApplicationNotPendingError extends Error {
  constructor() {
    super("This application has already been reviewed.");
  }
}

/**
 * Approves a pending application and creates (or reactivates) the trainer.
 * The status check in the UPDATE makes double-approval a no-op error.
 * The new trainer starts unpublished so they can review their profile first.
 */
export async function approveApplication(applicationId: string, reviewerId: string) {
  return db.transaction(async (tx) => {
    const [app] = await tx
      .update(trainerApplications)
      .set({ status: "approved", reviewedBy: reviewerId, reviewedAt: new Date() })
      .where(and(eq(trainerApplications.id, applicationId), eq(trainerApplications.status, "pending")))
      .returning();
    if (!app) throw new ApplicationNotPendingError();

    const [profile] = await tx.select().from(profiles).where(eq(profiles.userId, app.userId));
    const [existing] = await tx.select().from(trainers).where(eq(trainers.userId, app.userId));

    if (existing) {
      const [trainer] = await tx
        .update(trainers)
        .set({
          status: "approved",
          headline: app.headline,
          bio: app.bio,
          specialties: app.specialties,
        })
        .where(eq(trainers.id, existing.id))
        .returning();
      return trainer;
    }

    const base = pickFreeSlug(profile.displayName, []);
    const taken = await tx
      .select({ slug: trainers.slug })
      .from(trainers)
      .where(like(trainers.slug, `${base}%`));
    const slug = pickFreeSlug(profile.displayName, taken.map((t) => t.slug));

    const [trainer] = await tx
      .insert(trainers)
      .values({
        userId: app.userId,
        slug,
        displayName: profile.displayName,
        headline: app.headline,
        bio: app.bio,
        specialties: app.specialties,
      })
      .returning();
    return trainer;
  });
}

export async function rejectApplication(applicationId: string, reviewerId: string, reason: string) {
  const [app] = await db
    .update(trainerApplications)
    .set({ status: "rejected", rejectionReason: reason, reviewedBy: reviewerId, reviewedAt: new Date() })
    .where(and(eq(trainerApplications.id, applicationId), eq(trainerApplications.status, "pending")))
    .returning();
  if (!app) throw new ApplicationNotPendingError();
  return app;
}
