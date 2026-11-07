import { describe, expect, it } from "vitest";

import { slugify, slugSchema, trainerApplicationSchema } from "./trainer";

describe("slugify", () => {
  it("strips accents and punctuation", () => {
    expect(slugify("  Zoë O'Brien-Côté! ")).toBe("zoe-o-brien-cote");
  });

  it("caps length at 40 without a trailing hyphen", () => {
    const slug = slugify("a".repeat(39) + " b");
    expect(slug.length).toBeLessThanOrEqual(40);
    expect(slug.endsWith("-")).toBe(false);
  });
});

describe("slugSchema", () => {
  it("accepts valid slugs", () => {
    expect(slugSchema.parse("jane-doe-fit")).toBe("jane-doe-fit");
  });

  it.each(["ab", "Jane Doe", "jane--doe", "-jane", "admin", "trainers"])(
    "rejects %s",
    (slug) => {
      expect(slugSchema.safeParse(slug).success).toBe(false);
    },
  );
});

describe("trainerApplicationSchema", () => {
  const valid = {
    headline: "Strength coach for busy parents",
    bio: "I have coached hundreds of clients to their first pull-up and beyond. ".repeat(2),
    specialties: ["strength", "mobility"],
    certifications: "CSEP-CPT",
  };

  it("accepts a valid application", () => {
    expect(trainerApplicationSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects unknown specialties", () => {
    const result = trainerApplicationSchema.safeParse({ ...valid, specialties: ["juggling"] });
    expect(result.success).toBe(false);
  });

  it("rejects more than 5 specialties", () => {
    const result = trainerApplicationSchema.safeParse({
      ...valid,
      specialties: ["strength", "mobility", "yoga", "pilates", "running", "cycling"],
    });
    expect(result.success).toBe(false);
  });
});
