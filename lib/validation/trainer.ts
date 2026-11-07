import { z } from "zod";

import { PROVINCE_CODES, RESERVED_SLUGS, SPECIALTIES } from "@/lib/constants";

export const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and single hyphens")
  .min(3, "At least 3 characters")
  .max(40, "At most 40 characters")
  .refine((slug) => !RESERVED_SLUGS.has(slug), "That URL is reserved");

const specialtiesSchema = z
  .array(z.enum(SPECIALTIES))
  .min(1, "Pick at least one specialty")
  .max(5, "Pick up to 5 specialties")
  .transform((list) => [...new Set(list)]);

const headlineSchema = z.string().trim().min(10, "At least 10 characters").max(120);
const bioSchema = z.string().trim().min(50, "At least 50 characters").max(2000);

export const trainerApplicationSchema = z.object({
  headline: headlineSchema,
  bio: bioSchema,
  specialties: specialtiesSchema,
  certifications: z.string().trim().min(3, "List at least one certification").max(1000),
});

export const trainerProfileSchema = z.object({
  displayName: z.string().trim().min(2).max(60),
  slug: slugSchema,
  headline: headlineSchema,
  bio: bioSchema,
  specialties: specialtiesSchema,
  yearsExperience: z.coerce.number().int().min(0).max(60).optional(),
  city: z.string().trim().max(80).optional(),
  province: z.enum(PROVINCE_CODES).optional(),
  acceptingClients: z.boolean(),
  published: z.boolean(),
});

/** Turns a display name into a candidate slug (uniqueness is checked in the DB). */
export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
    .replace(/-+$/g, "");
}
