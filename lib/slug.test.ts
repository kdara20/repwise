import { describe, expect, it } from "vitest";

import { pickFreeSlug } from "./slug";
import { slugSchema } from "./validation/trainer";

describe("pickFreeSlug", () => {
  it("uses the slugified name when free", () => {
    expect(pickFreeSlug("Jane Doe", [])).toBe("jane-doe");
  });

  it("appends the next free number", () => {
    expect(pickFreeSlug("Jane Doe", ["jane-doe", "jane-doe-2"])).toBe("jane-doe-3");
  });

  it("avoids reserved and too-short slugs", () => {
    expect(pickFreeSlug("Admin", [])).toBe("admin-coach");
    expect(pickFreeSlug("Al", [])).toBe("trainer-al");
    expect(pickFreeSlug("李", [])).toBe("trainer");
  });

  it("always produces a slug that passes validation", () => {
    for (const name of ["Jane Doe", "Admin", "Al", "李", "x".repeat(60)]) {
      const slug = pickFreeSlug(name, [slugSchema.safeParse(name).data ?? ""]);
      expect(slugSchema.safeParse(slug).success, slug).toBe(true);
    }
  });

  it("keeps long slugs within 40 characters when suffixed", () => {
    const base = pickFreeSlug("a".repeat(60), []);
    expect(pickFreeSlug("a".repeat(60), [base]).length).toBeLessThanOrEqual(40);
  });
});
