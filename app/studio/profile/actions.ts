"use server";

import { eq } from "drizzle-orm";
import { updateTag } from "next/cache";

import {
  checked,
  invalid,
  isUniqueViolation,
  list,
  optionalText,
  text,
  type ActionState,
} from "@/lib/actions";
import { TRAINERS_TAG, trainerTag } from "@/lib/data/trainers";
import { db } from "@/lib/db";
import { trainers } from "@/lib/db/schema";
import { requireTrainer } from "@/lib/dal/session";
import { trainerProfileSchema } from "@/lib/validation/trainer";

export async function updateProfile(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { trainer } = await requireTrainer();

  const values = {
    displayName: text(formData, "displayName"),
    slug: text(formData, "slug"),
    headline: text(formData, "headline"),
    bio: text(formData, "bio"),
    specialties: list(formData, "specialties"),
    yearsExperience: optionalText(formData, "yearsExperience"),
    city: optionalText(formData, "city"),
    province: optionalText(formData, "province"),
    acceptingClients: checked(formData, "acceptingClients"),
    published: checked(formData, "published"),
  };
  const parsed = trainerProfileSchema.safeParse(values);
  if (!parsed.success) return invalid(parsed.error, values);

  const data = parsed.data;
  try {
    await db
      .update(trainers)
      .set({
        ...data,
        yearsExperience: data.yearsExperience ?? null,
        city: data.city ?? null,
        province: data.province ?? null,
      })
      .where(eq(trainers.id, trainer.id));
  } catch (error) {
    if (isUniqueViolation(error, "trainers_slug_unique")) {
      return {
        ok: false,
        message: "Please fix the highlighted fields.",
        fieldErrors: { slug: ["That URL is taken — try another."] },
        values,
      };
    }
    throw error;
  }

  // Directory, home, sitemap, and both the old and new profile URLs.
  updateTag(TRAINERS_TAG);
  updateTag(trainerTag(trainer.slug));
  if (data.slug !== trainer.slug) updateTag(trainerTag(data.slug));

  return {
    ok: true,
    message: data.published ? "Saved. Your profile is live." : "Saved. Your profile is hidden.",
  };
}
