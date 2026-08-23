import { describe, expect, it } from "vitest";
import { paginated, parsePagination } from "./guards";

describe("API pagination helpers", () => {
  it("uses safe defaults and caps the requested limit", () => {
    expect(parsePagination(new URLSearchParams())).toEqual({
      page: 1,
      limit: 12,
      offset: 0,
    });

    expect(
      parsePagination(new URLSearchParams("page=3&limit=1000"))
    ).toEqual({
      page: 3,
      limit: 100,
      offset: 200,
    });
  });

  it("normalizes invalid pagination values", () => {
    expect(
      parsePagination(new URLSearchParams("page=-4&limit=0"))
    ).toEqual({
      page: 1,
      limit: 12,
      offset: 0,
    });
  });

  it("returns consistent pagination metadata", () => {
    expect(paginated(["a", "b"], 5, 1, 2)).toEqual({
      data: ["a", "b"],
      pagination: {
        page: 1,
        limit: 2,
        total: 5,
        totalPages: 3,
      },
    });
  });
});
