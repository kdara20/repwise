import type { MetadataRoute } from "next";

import { getListedSlugs } from "@/lib/data/trainers";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const trainers = await getListedSlugs();
  return [
    { url: siteUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/trainers`, changeFrequency: "daily", priority: 0.9 },
    ...trainers.map((t) => ({
      url: `${siteUrl}/trainers/${t.slug}`,
      lastModified: t.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
