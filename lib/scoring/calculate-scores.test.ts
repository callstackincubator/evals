import {
  calculateCategoryScore,
  calculateDelta,
  calculateEvalScore,
  calculateOverallScore,
} from "@/lib/scoring/calculate-scores";

describe("calculate-scores", () => {
  it("calculates eval score from requirement pass ratio", () => {
    expect(calculateEvalScore(5, 5)).toBe(100);
    expect(calculateEvalScore(0, 5)).toBe(0);
    expect(calculateEvalScore(3, 5)).toBe(60);
  });

  it("calculates average category score", () => {
    expect(calculateCategoryScore([50, 100, 0])).toBeCloseTo(50);
  });

  it("calculates weighted overall score by eval count", () => {
    const overall = calculateOverallScore([
      { scorePct: 100, evalCount: 10 },
      { scorePct: 50, evalCount: 20 },
      { scorePct: 0, evalCount: 10 },
    ]);

    expect(overall).toBeCloseTo(50);
  });

  it("calculates deltas", () => {
    expect(calculateDelta(62.5, 70.5)).toBeCloseTo(8);
  });
});
