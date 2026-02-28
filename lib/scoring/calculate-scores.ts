import { clamp } from "@/lib/utils";

export function calculateEvalScore(passedRequirements: number, totalRequirements: number): number {
  if (totalRequirements <= 0) {
    return 0;
  }

  return (passedRequirements / totalRequirements) * 100;
}

export function calculateCategoryScore(evalScores: number[]): number {
  if (evalScores.length === 0) {
    return 0;
  }

  const sum = evalScores.reduce((acc, value) => acc + value, 0);
  return sum / evalScores.length;
}

export function calculateOverallScore(weightedCategories: Array<{ scorePct: number; evalCount: number }>): number {
  const totalWeight = weightedCategories.reduce((acc, item) => acc + item.evalCount, 0);

  if (totalWeight <= 0) {
    return 0;
  }

  const weightedSum = weightedCategories.reduce(
    (acc, item) => acc + item.scorePct * item.evalCount,
    0,
  );

  return weightedSum / totalWeight;
}

export function calculateDelta(base: number, compare: number): number {
  return compare - base;
}

export function normalizeProbability(value: number): number {
  return clamp(value, 0, 100);
}
