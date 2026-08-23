import { describe, expect, it } from "vitest";
import {
  calculateDiscount,
  formatPhone,
  isValidPhone,
  slugify,
} from "./utils";

describe("checkout and catalog utilities", () => {
  it("accepts valid Kenyan mobile numbers and rejects malformed values", () => {
    expect(isValidPhone("0712345678")).toBe(true);
    expect(isValidPhone("+254712345678")).toBe(true);
    expect(isValidPhone("071234567")).toBe(false);
    expect(isValidPhone("254712345678")).toBe(false);
  });

  it("normalizes Kenyan phone numbers for Daraja", () => {
    expect(formatPhone("0712345678")).toBe("254712345678");
    expect(formatPhone("+254712345678")).toBe("254712345678");
    expect(formatPhone("254712345678")).toBe("254712345678");
  });

  it("creates stable URL slugs", () => {
    expect(slugify("  Canva & Social Media Pack! ")).toBe(
      "canva-social-media-pack"
    );
  });

  it("calculates rounded sale discounts", () => {
    expect(calculateDiscount(1000, 750)).toBe(25);
    expect(calculateDiscount(999, 699)).toBe(30);
  });
});
