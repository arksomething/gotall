import { calculateDreamHeightProbability } from "../utils/dreamHeightProbability";
import * as projection from "../utils/heightProjection";

jest.mock("../utils/heightProjection", () => ({
  calculateHeightProjection: jest.fn(() => ({ potentialHeight: "6'0\"" })),
}));

describe("dreamHeightProbability", () => {
  it("gives high probability when dream <= potential", () => {
    const result = calculateDreamHeightProbability({
      dreamHeightCm: 182, // ~6'0"
      currentHeightCm: 165, // 5'5"
      age: 14,
      sex: "1",
      motherHeightCm: 160,
      fatherHeightCm: 175,
    });
    expect(result.probability).toBeGreaterThanOrEqual(80);
  });

  it("drops probability when dream exceeds potential by 15cm", () => {
    (projection.calculateHeightProjection as jest.Mock).mockReturnValueOnce({ potentialHeight: "5'7\"" });
    const result = calculateDreamHeightProbability({
      dreamHeightCm: 190, // ~6'3"
      currentHeightCm: 165,
      age: 14,
      sex: "1",
      motherHeightCm: 160,
      fatherHeightCm: 175,
    });
    expect(result.probability).toBeLessThanOrEqual(20);
  });

  it("probability decreases as dream height moves further from potential", () => {
    (projection.calculateHeightProjection as jest.Mock).mockReturnValue({ potentialHeight: "5'9\"" });

    const close = calculateDreamHeightProbability({
      dreamHeightCm: 175, // 5'9" (equal)
      currentHeightCm: 165,
      age: 14,
      sex: "1",
    });

    const far = calculateDreamHeightProbability({
      dreamHeightCm: 190, // ~6'3"
      currentHeightCm: 165,
      age: 14,
      sex: "1",
    });

    expect(close.probability).toBeGreaterThan(far.probability);
  });
}); 