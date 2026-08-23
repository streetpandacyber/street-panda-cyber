import { describe, expect, it } from "vitest";
import { countActiveFilters } from "./FilterSidebar";

describe("marketplace filter count", () => {
  it("does not count the default price ceiling", () => {
    expect(
      countActiveFilters(
        { categories: [], maxPrice: 1200, minRating: 0, tags: [] },
        1200
      )
    ).toBe(0);
  });

  it("counts only filters that differ from the current defaults", () => {
    expect(
      countActiveFilters(
        { categories: ["c-01"], maxPrice: 900, minRating: 4, tags: ["ai"] },
        1200
      )
    ).toBe(4);
  });
});
