import { RESERVED_SLUGS } from "@/lib/constants";
import { slugify } from "@/lib/validation/trainer";

/**
 * Picks the first free slug: `base`, then `base-2`, `base-3`, …
 * `taken` holds existing slugs that start with the base.
 */
export function pickFreeSlug(name: string, taken: Iterable<string>): string {
  let base = slugify(name);
  if (base.length < 3) base = `trainer-${base}`.replace(/-+$/, "");
  if (RESERVED_SLUGS.has(base)) base = `${base}-coach`;

  const used = new Set(taken);
  if (!used.has(base)) return base;
  for (let n = 2; ; n++) {
    const suffix = `-${n}`;
    const candidate = `${base.slice(0, 40 - suffix.length).replace(/-+$/, "")}${suffix}`;
    if (!used.has(candidate)) return candidate;
  }
}
