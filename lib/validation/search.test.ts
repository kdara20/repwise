import { describe, expect, it } from "vitest";

import { parseTrainerSearch, trainerSearchHref } from "./search";

describe("parseTrainerSearch", () => {
  it("parses valid params", () => {
    expect(parseTrainerSearch({ q: " yoga ", specialty: "yoga", province: "ON", page: "2" })).toEqual({
      q: "yoga",
      specialty: "yoga",
      province: "ON",
      page: 2,
    });
  });

  it("drops invalid values individually instead of failing", () => {
    expect(parseTrainerSearch({ q: "run", specialty: "juggling", province: "XX", page: "-3" })).toEqual({
      q: "run",
      specialty: undefined,
      province: undefined,
      page: 1,
    });
  });

  it("uses the first value of repeated params and ignores empty q", () => {
    expect(parseTrainerSearch({ q: "", province: ["BC", "ON"] })).toMatchObject({
      q: undefined,
      province: "BC",
      page: 1,
    });
  });
});

describe("trainerSearchHref", () => {
  it("omits empty values and page 1", () => {
    expect(trainerSearchHref({ q: "", page: 1 })).toBe("/trainers");
    expect(trainerSearchHref({ q: "kettle bell", province: "QC", page: 3 })).toBe(
      "/trainers?q=kettle+bell&province=QC&page=3",
    );
  });
});
