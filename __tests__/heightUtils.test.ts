import { parseHeightToCm, validateHeightInput } from "../utils/heightUtils";

describe("heightUtils", () => {
  describe("parseHeightToCm", () => {
    it.each([
      ["5 ft 8 in", "ft", 173],
      ["5'8\"", "ft", 173],
      ["170", "cm", 170],
      ["6 0", "ft", 183],
    ])("%s (%s) => ~%i cm", (input, unit, expected) => {
      const cm = parseHeightToCm(input as string, unit as "ft" | "cm");
      expect(Math.abs(cm - expected)).toBeLessThanOrEqual(1);
    });
  });

  describe("validateHeightInput", () => {
    it("rejects empty string", () => {
      const result = validateHeightInput("", "ft");
      expect(result.isValid).toBe(false);
    });

    it("accepts 5'8\"", () => {
      const result = validateHeightInput("5'8\"", "ft");
      expect(result.isValid).toBe(true);
      expect(result.heightInCm).toBeDefined();
    });
  });
}); 