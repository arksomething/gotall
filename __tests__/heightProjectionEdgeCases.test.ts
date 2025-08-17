import { calculateHeightProjection, getProjectedHeights } from "../utils/heightProjection";
import { parseHeightToCm } from "../utils/heightUtils";

describe("heightProjection edge cases", () => {
  describe("very young children (2-5 years old)", () => {
    it("handles 2 year old child", () => {
      const userData = {
        heightCm: 85, // ~2'9"
        age: 2,
        sex: "1" as const,
        motherHeightCm: 160,
        fatherHeightCm: 175,
      };

      const proj = calculateHeightProjection(userData);
      const potentialCm = parseHeightToCm(proj.potentialHeight, "ft");
      const actualCm = parseHeightToCm(proj.actualHeight, "ft");

      expect(potentialCm).toBeGreaterThanOrEqual(userData.heightCm);
      expect(actualCm).toBeGreaterThanOrEqual(userData.heightCm);
      expect(potentialCm).toBeGreaterThanOrEqual(actualCm);
    });

    it("handles 5 year old child", () => {
      const userData = {
        heightCm: 110, // ~3'7"
        age: 5,
        sex: "2" as const,
        motherHeightCm: 165,
        fatherHeightCm: 180,
      };

      const proj = calculateHeightProjection(userData);
      const potentialCm = parseHeightToCm(proj.potentialHeight, "ft");
      const actualCm = parseHeightToCm(proj.actualHeight, "ft");

      expect(potentialCm).toBeGreaterThanOrEqual(userData.heightCm);
      expect(actualCm).toBeGreaterThanOrEqual(userData.heightCm);
      expect(potentialCm).toBeGreaterThanOrEqual(actualCm);
    });
  });

  describe("extreme height percentiles", () => {
    it("handles very tall child (above 97th percentile)", () => {
      const userData = {
        heightCm: 180, // Very tall for a child
        age: 12,
        sex: "1" as const,
        motherHeightCm: 170,
        fatherHeightCm: 190,
      };

      const proj = calculateHeightProjection(userData);
      const potentialCm = parseHeightToCm(proj.potentialHeight, "ft");
      const actualCm = parseHeightToCm(proj.actualHeight, "ft");

      expect(potentialCm).toBeGreaterThanOrEqual(userData.heightCm);
      expect(actualCm).toBeGreaterThanOrEqual(userData.heightCm);
      expect(potentialCm).toBeGreaterThanOrEqual(actualCm);
    });

    it("handles very short child (below 3rd percentile)", () => {
      const userData = {
        heightCm: 120, // Very short for age
        age: 10,
        sex: "2" as const,
        motherHeightCm: 150,
        fatherHeightCm: 160,
      };

      const proj = calculateHeightProjection(userData);
      const potentialCm = parseHeightToCm(proj.potentialHeight, "ft");
      const actualCm = parseHeightToCm(proj.actualHeight, "ft");

      expect(potentialCm).toBeGreaterThanOrEqual(userData.heightCm);
      expect(actualCm).toBeGreaterThanOrEqual(userData.heightCm);
      expect(potentialCm).toBeGreaterThanOrEqual(actualCm);
    });
  });

  describe("missing parent heights", () => {
    it("handles missing mother height", () => {
      const userData = {
        heightCm: 150,
        age: 14,
        sex: "1" as const,
        fatherHeightCm: 175,
        // motherHeightCm: undefined
      };

      const proj = calculateHeightProjection(userData);
      const potentialCm = parseHeightToCm(proj.potentialHeight, "ft");
      const actualCm = parseHeightToCm(proj.actualHeight, "ft");

      expect(potentialCm).toBeGreaterThanOrEqual(userData.heightCm);
      expect(actualCm).toBeGreaterThanOrEqual(userData.heightCm);
      expect(potentialCm).toBeGreaterThanOrEqual(actualCm);
    });

    it("handles missing father height", () => {
      const userData = {
        heightCm: 150,
        age: 14,
        sex: "2" as const,
        motherHeightCm: 160,
        // fatherHeightCm: undefined
      };

      const proj = calculateHeightProjection(userData);
      const potentialCm = parseHeightToCm(proj.potentialHeight, "ft");
      const actualCm = parseHeightToCm(proj.actualHeight, "ft");

      expect(potentialCm).toBeGreaterThanOrEqual(userData.heightCm);
      expect(actualCm).toBeGreaterThanOrEqual(userData.heightCm);
      expect(potentialCm).toBeGreaterThanOrEqual(actualCm);
    });

    it("handles missing both parent heights", () => {
      const userData = {
        heightCm: 150,
        age: 14,
        sex: "1" as const,
        // motherHeightCm: undefined
        // fatherHeightCm: undefined
      };

      const proj = calculateHeightProjection(userData);
      const potentialCm = parseHeightToCm(proj.potentialHeight, "ft");
      const actualCm = parseHeightToCm(proj.actualHeight, "ft");

      expect(potentialCm).toBeGreaterThanOrEqual(userData.heightCm);
      expect(actualCm).toBeGreaterThanOrEqual(userData.heightCm);
      expect(potentialCm).toBeGreaterThanOrEqual(actualCm);
    });
  });

  describe("adult age boundaries", () => {
    it("handles exactly 18 years old", () => {
      const userData = {
        heightCm: 170,
        age: 18,
        sex: "1" as const,
        motherHeightCm: 165,
        fatherHeightCm: 180,
      };

      const proj = calculateHeightProjection(userData);
      const potentialCm = parseHeightToCm(proj.potentialHeight, "ft");
      const actualCm = parseHeightToCm(proj.actualHeight, "ft");

      expect(potentialCm).toBeGreaterThanOrEqual(userData.heightCm);
      expect(actualCm).toBeGreaterThanOrEqual(userData.heightCm);
      expect(potentialCm).toBeGreaterThanOrEqual(actualCm);
      // Should allow more growth than adults
      expect(potentialCm - userData.heightCm).toBeLessThanOrEqual(8); // ~3 inches max
    });

    it("handles exactly 21 years old", () => {
      const userData = {
        heightCm: 175,
        age: 21,
        sex: "2" as const,
        motherHeightCm: 160,
        fatherHeightCm: 175,
      };

      const proj = calculateHeightProjection(userData);
      const potentialCm = parseHeightToCm(proj.potentialHeight, "ft");
      const actualCm = parseHeightToCm(proj.actualHeight, "ft");

      expect(potentialCm).toBeGreaterThanOrEqual(userData.heightCm);
      expect(actualCm).toBeGreaterThanOrEqual(userData.heightCm);
      expect(potentialCm).toBeGreaterThanOrEqual(actualCm);
      // Should limit growth to 1 inch max
      expect(potentialCm - userData.heightCm).toBeLessThanOrEqual(3); // ~1 inch max
    });

    it("handles older adults (25+ years)", () => {
      const userData = {
        heightCm: 180,
        age: 25,
        sex: "1" as const,
        motherHeightCm: 165,
        fatherHeightCm: 180,
      };

      const proj = calculateHeightProjection(userData);
      const potentialCm = parseHeightToCm(proj.potentialHeight, "ft");
      const actualCm = parseHeightToCm(proj.actualHeight, "ft");

      expect(potentialCm).toBeGreaterThanOrEqual(userData.heightCm);
      expect(actualCm).toBeGreaterThanOrEqual(userData.heightCm);
      expect(potentialCm).toBeGreaterThanOrEqual(actualCm);
      // Should limit growth to 1 inch max
      expect(potentialCm - userData.heightCm).toBeLessThanOrEqual(3); // ~1 inch max
    });
  });

  describe("both sexes", () => {
    it("handles male with typical growth pattern", () => {
      const userData = {
        heightCm: 160,
        age: 16,
        sex: "1" as const, // Male
        motherHeightCm: 165,
        fatherHeightCm: 180,
      };

      const proj = calculateHeightProjection(userData);
      const potentialCm = parseHeightToCm(proj.potentialHeight, "ft");
      const actualCm = parseHeightToCm(proj.actualHeight, "ft");

      expect(potentialCm).toBeGreaterThanOrEqual(userData.heightCm);
      expect(actualCm).toBeGreaterThanOrEqual(userData.heightCm);
      expect(potentialCm).toBeGreaterThanOrEqual(actualCm);
    });

    it("handles female with typical growth pattern", () => {
      const userData = {
        heightCm: 155,
        age: 16,
        sex: "2" as const, // Female
        motherHeightCm: 160,
        fatherHeightCm: 175,
      };

      const proj = calculateHeightProjection(userData);
      const potentialCm = parseHeightToCm(proj.potentialHeight, "ft");
      const actualCm = parseHeightToCm(proj.actualHeight, "ft");

      expect(potentialCm).toBeGreaterThanOrEqual(userData.heightCm);
      expect(actualCm).toBeGreaterThanOrEqual(userData.heightCm);
      expect(potentialCm).toBeGreaterThanOrEqual(actualCm);
    });
  });

  describe("boundary conditions", () => {
    it("handles minimum reasonable height", () => {
      const userData = {
        heightCm: 91, // ~3'0" - minimum reasonable height
        age: 8,
        sex: "1" as const,
        motherHeightCm: 150,
        fatherHeightCm: 160,
      };

      const proj = calculateHeightProjection(userData);
      const potentialCm = parseHeightToCm(proj.potentialHeight, "ft");
      const actualCm = parseHeightToCm(proj.actualHeight, "ft");

      expect(potentialCm).toBeGreaterThanOrEqual(userData.heightCm);
      expect(actualCm).toBeGreaterThanOrEqual(userData.heightCm);
      expect(potentialCm).toBeGreaterThanOrEqual(actualCm);
    });

    it("handles maximum reasonable height", () => {
      const userData = {
        heightCm: 244, // ~8'0" - maximum reasonable height
        age: 20,
        sex: "1" as const,
        motherHeightCm: 180,
        fatherHeightCm: 200,
      };

      const proj = calculateHeightProjection(userData);
      const potentialCm = parseHeightToCm(proj.potentialHeight, "ft");
      const actualCm = parseHeightToCm(proj.actualHeight, "ft");



      expect(potentialCm).toBeGreaterThanOrEqual(userData.heightCm);
      // Allow small rounding differences for very tall heights
      expect(actualCm).toBeGreaterThanOrEqual(userData.heightCm - 1);
      expect(potentialCm).toBeGreaterThanOrEqual(actualCm);
    });

    it("handles current height equal to potential height", () => {
      const userData = {
        heightCm: 190,
        age: 22, // Adult
        sex: "1" as const,
        motherHeightCm: 165,
        fatherHeightCm: 180,
      };

      const proj = calculateHeightProjection(userData);
      const potentialCm = parseHeightToCm(proj.potentialHeight, "ft");
      const actualCm = parseHeightToCm(proj.actualHeight, "ft");

      expect(potentialCm).toBeGreaterThanOrEqual(userData.heightCm);
      expect(actualCm).toBeGreaterThanOrEqual(userData.heightCm);
      expect(potentialCm).toBeGreaterThanOrEqual(actualCm);
    });
  });

  describe("CDC projection edge cases", () => {
    it("handles age not in CDC data", () => {
      // Test with an age that might not be in the CDC data
      try {
        const result = getProjectedHeights(150, 25, "1"); // 25 year old
        expect(result).toBeDefined();
      } catch (error) {
        // It's okay if this throws an error for ages not in CDC data
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain("No data found for age");
      }
    });

    it("handles extreme height percentiles in CDC data", () => {
      // Test very tall child
      const tallResult = getProjectedHeights(180, 12, "1");
      expect(tallResult).toBeDefined();

      // Test very short child
      const shortResult = getProjectedHeights(120, 10, "2");
      expect(shortResult).toBeDefined();
    });
  });

  describe("growth constraints", () => {
    it("respects adult growth limits", () => {
      const userData = {
        heightCm: 170,
        age: 25,
        sex: "2" as const,
        motherHeightCm: 200, // Very tall mother
        fatherHeightCm: 210, // Very tall father
      };

      const proj = calculateHeightProjection(userData);
      const potentialCm = parseHeightToCm(proj.potentialHeight, "ft");
      
      // Should not grow more than 1 inch (about 2.54 cm)
      expect(potentialCm - userData.heightCm).toBeLessThanOrEqual(3);
    });
  });
}); 