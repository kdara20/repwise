import { z } from "zod";

import { PROVINCE_CODES, SPECIALTIES } from "@/lib/constants";
import type { TrainerSearch } from "@/lib/data/trainers";

const first = (v: unknown) => (Array.isArray(v) ? v[0] : v);

/** Each field falls back on its own, so one bad param never breaks the page. */
const schema = z.object({
  q: z.preprocess(first, z.string().trim().max(100).optional()).catch(undefined),
  specialty: z.preprocess(first, z.enum(SPECIALTIES).optional()).catch(undefined),
  province: z.preprocess(first, z.enum(PROVINCE_CODES).optional()).catch(undefined),
  page: z.preprocess(first, z.coerce.number().int().min(1).max(500)).catch(1),
});

export function parseTrainerSearch(params: Record<string, string | string[] | undefined>): TrainerSearch {
  const parsed = schema.parse(params);
  return { ...parsed, q: parsed.q || undefined };
}

/** Builds a /trainers URL, dropping empty values and page 1. */
export function trainerSearchHref(search: Partial<TrainerSearch>): string {
  const params = new URLSearchParams();
  if (search.q) params.set("q", search.q);
  if (search.specialty) params.set("specialty", search.specialty);
  if (search.province) params.set("province", search.province);
  if (search.page && search.page > 1) params.set("page", String(search.page));
  const qs = params.toString();
  return qs ? `/trainers?${qs}` : "/trainers";
}
