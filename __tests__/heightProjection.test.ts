import { calculateHeightProjection, getProjectedHeights } from "../utils/heightProjection";
import { parseHeightToCm } from "../utils/heightUtils";

describe("heightProjection", () => {
  it("potential height is not shorter than current height for teens", () => {
    const userData = {
      heightCm: 165, // 5'5"
      age: 14,
      sex: "1" as const,
      motherHeightCm: 160,
      fatherHeightCm: 175,
    };

    const proj = calculateHeightProjection(userData);
    const potentialCm = parseHeightToCm(proj.potentialHeight, "ft");

    expect(potentialCm).toBeGreaterThanOrEqual(userData.heightCm);
  });

  it("adult (>21) potential height is at most 1 inch above current", () => {
    const userData = {
      heightCm: 180,
      age: 22,
      sex: "1" as const,
    } as any;

    const proj = calculateHeightProjection(userData);
    const potentialCm = parseHeightToCm(proj.potentialHeight, "ft");
    expect(potentialCm - userData.heightCm).toBeLessThanOrEqual(3); // 1 inch ≈ 2.54cm
  });

  it("getProjectedHeights returns at least one projection", () => {
    const result = getProjectedHeights(150, 10, "2");
    expect(result.lower || result.exact || result.upper).toBeTruthy();
  });
}); 