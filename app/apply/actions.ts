"use server";

import { redirect } from "next/navigation";

import { invalid, isUniqueViolation, list, text, type ActionState } from "@/lib/actions";
import { getLatestApplication } from "@/lib/data/applications";
import { db } from "@/lib/db";
import { trainerApplications } from "@/lib/db/schema";
import { requireUser } from "@/lib/dal/session";
import { trainerApplicationSchema } from "@/lib/validation/trainer";

export async function submitApplication(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const viewer = await requireUser();
  if (viewer.trainer) redirect("/studio/profile");

  const values = {
    headline: text(formData, "headline"),
    bio: text(formData, "bio"),
    specialties: list(formData, "specialties"),
    certifications: text(formData, "certifications"),
  };
  const parsed = trainerApplicationSchema.safeParse(values);
  if (!parsed.success) return invalid(parsed.error, values);

  const latest = await getLatestApplication(viewer.user.id);
  if (latest?.status === "pending") redirect("/apply");

  try {
    await db.insert(trainerApplications).values({ userId: viewer.user.id, ...parsed.data });
  } catch (error) {
    // A double submit races the pending check; the partial unique index wins.
    if (isUniqueViolation(error, "trainer_applications_one_pending_per_user")) redirect("/apply");
    throw error;
  }

  redirect("/apply");
}
