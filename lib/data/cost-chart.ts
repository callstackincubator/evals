import type { CategoryDefinition, ModelSummary } from "@/lib/types/evals";

export interface CostScatterPoint {
  modelId: string;
  modelLabel: string;
  scorePct: number;
  costUsd: number;
  isOnFrontier: boolean;
}

export interface CostScatterData {
  points: CostScatterPoint[];
  frontierPoints: CostScatterPoint[];
  omittedModelIds: string[];
}

function markParetoFrontier(points: Omit<CostScatterPoint, "isOnFrontier">[]): CostScatterPoint[] {
  const sorted = [...points].sort((left, right) => {
    if (left.costUsd !== right.costUsd) {
      return left.costUsd - right.costUsd;
    }

    return right.scorePct - left.scorePct;
  });

  let bestScore = Number.NEGATIVE_INFINITY;

  return sorted.map((point) => {
    const isOnFrontier = point.scorePct > bestScore;

    if (isOnFrontier) {
      bestScore = point.scorePct;
    }

    return {
      ...point,
      isOnFrontier,
    };
  });
}

export function buildOverviewCostScatterData(models: ModelSummary[]): CostScatterData {
  const points = markParetoFrontier(
    models
      .filter((model) => model.costUsd !== null)
      .map((model) => ({
        modelId: model.id,
        modelLabel: model.label,
        scorePct: model.overallScorePct,
        costUsd: model.costUsd ?? 0,
      })),
  );

  return {
    points,
    frontierPoints: points.filter((point) => point.isOnFrontier),
    omittedModelIds: models.filter((model) => model.costUsd === null).map((model) => model.id),
  };
}

export function buildCategoryCostScatterData(
  category: CategoryDefinition,
  models: ModelSummary[],
): CostScatterData {
  const points = markParetoFrontier(
    models
      .flatMap((model) => {
        const categoryScore = model.categories[category.id];

        if (!categoryScore || categoryScore.costUsd === null) {
          return [];
        }

        return [{
          modelId: model.id,
          modelLabel: model.label,
          scorePct: categoryScore.scorePct,
          costUsd: categoryScore.costUsd,
        }];
      }),
  );

  const includedIds = new Set(points.map((point) => point.modelId));

  return {
    points,
    frontierPoints: points.filter((point) => point.isOnFrontier),
    omittedModelIds: models
      .filter((model) => !includedIds.has(model.id))
      .map((model) => model.id),
  };
}
