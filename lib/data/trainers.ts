import "server-only";
import { and, arrayContains, count, desc, eq, isNull, sql, type SQL } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";

import type { Province, Specialty } from "@/lib/constants";
import { db } from "@/lib/db";
import { profiles, trainers } from "@/lib/db/schema";

export const TRAINERS_TAG = "trainers";
export const trainerTag = (slug: string) => `trainer:${slug}`;
export const PAGE_SIZE = 12;

/** Public card fields only — never select user ids or internal state for public pages. */
const publicColumns = {
  slug: trainers.slug,
  displayName: trainers.displayName,
  headline: trainers.headline,
  bio: trainers.bio,
  specialties: trainers.specialties,
  yearsExperience: trainers.yearsExperience,
  city: trainers.city,
  province: trainers.province,
  acceptingClients: trainers.acceptingClients,
  imageUrl: profiles.imageUrl,
  updatedAt: trainers.updatedAt,
};

export type PublicTrainer = {
  slug: string;
  displayName: string;
  headline: string;
  bio: string;
  specialties: string[];
  yearsExperience: number | null;
  city: string | null;
  province: string | null;
  acceptingClients: boolean;
  imageUrl: string | null;
  updatedAt: Date;
};

/** Visible to the public: approved, published, owner account not deleted. */
const isListed = and(
  eq(trainers.published, true),
  eq(trainers.status, "approved"),
  isNull(profiles.deletedAt),
);

export type TrainerSearch = {
  q?: string;
  specialty?: Specialty;
  province?: Province;
  page: number;
};

export async function searchTrainers({ q, specialty, province, page }: TrainerSearch) {
  "use cache";
  cacheTag(TRAINERS_TAG);
  cacheLife("hours");

  const query = q?.trim() ? sql`websearch_to_tsquery('english', ${q.trim()})` : undefined;
  const filters: (SQL | undefined)[] = [
    isListed,
    query && sql`${trainers.search} @@ ${query}`,
    specialty && arrayContains(trainers.specialties, [specialty]),
    province && eq(trainers.province, province),
  ];
  const where = and(...filters);

  const [items, [{ total }]] = await Promise.all([
    db
      .select(publicColumns)
      .from(trainers)
      .innerJoin(profiles, eq(profiles.userId, trainers.userId))
      .where(where)
      .orderBy(
        ...(query ? [desc(sql`ts_rank(${trainers.search}, ${query})`)] : []),
        desc(trainers.acceptingClients),
        desc(trainers.updatedAt),
      )
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE),
    db
      .select({ total: count() })
      .from(trainers)
      .innerJoin(profiles, eq(profiles.userId, trainers.userId))
      .where(where),
  ]);

  return { items: items as PublicTrainer[], total, pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

export async function getPublicTrainer(slug: string): Promise<PublicTrainer | null> {
  "use cache";
  cacheTag(TRAINERS_TAG, trainerTag(slug));
  cacheLife("hours");

  const [row] = await db
    .select(publicColumns)
    .from(trainers)
    .innerJoin(profiles, eq(profiles.userId, trainers.userId))
    .where(and(isListed, eq(trainers.slug, slug)))
    .limit(1);
  return (row as PublicTrainer | undefined) ?? null;
}

export async function getFeaturedTrainers(limit = 3): Promise<PublicTrainer[]> {
  "use cache";
  cacheTag(TRAINERS_TAG);
  cacheLife("hours");

  const rows = await db
    .select(publicColumns)
    .from(trainers)
    .innerJoin(profiles, eq(profiles.userId, trainers.userId))
    .where(and(isListed, eq(trainers.acceptingClients, true)))
    .orderBy(desc(trainers.updatedAt))
    .limit(limit);
  return rows as PublicTrainer[];
}

export async function getListedSlugs(): Promise<{ slug: string; updatedAt: Date }[]> {
  "use cache";
  cacheTag(TRAINERS_TAG);
  cacheLife("hours");

  return db
    .select({ slug: trainers.slug, updatedAt: trainers.updatedAt })
    .from(trainers)
    .innerJoin(profiles, eq(profiles.userId, trainers.userId))
    .where(isListed);
}
