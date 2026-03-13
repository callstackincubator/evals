import {
  type AggregateDataset,
  type CategoryDefinition,
  type CategoryScore,
  type DashboardData,
  type EvalMatrixEntry,
  type EvalScore,
  type ModelSummary,
} from "@/lib/types/evals";

const CATEGORY_ORDER: Record<string, number> = {
  navigation: 1,
  animation: 2,
  "async-state": 3,
};

const CATEGORY_LABELS: Record<string, string> = {
  navigation: "Navigation",
  animation: "Animation",
  "async-state": "Async State",
};

function titleCaseWord(word: string): string {
  if (word.length === 0) {
    return word;
  }

  return word[0].toUpperCase() + word.slice(1);
}

function humanizeCategoryId(categoryId: string): string {
  if (CATEGORY_LABELS[categoryId]) {
    return CATEGORY_LABELS[categoryId];
  }

  return categoryId
    .split("-")
    .map((part) => titleCaseWord(part))
    .join(" ");
}

function evalNameFromId(evalId: string): string {
  const withoutPrefix = evalId.replace(/^\d+-/, "");
  return withoutPrefix
    .split("-")
    .map((part) => part.toUpperCase() === part ? part : titleCaseWord(part))
    .join(" ");
}

function toPercent(value: number): number {
  return value * 100;
}

function pickPreferredCostUsd(costs: Array<number | undefined>): number | null {
  for (const cost of costs) {
    if (typeof cost === "number" && Number.isFinite(cost) && cost > 0) {
      return cost;
    }
  }

  return null;
}

function pickEvalDisplayCostUsd(evalResult: AggregateDataset["models"][number]["results"]["per_eval"][number]): number | null {
  return pickPreferredCostUsd([
    evalResult.api_estimated_cost_total_usd,
    evalResult.effective_cost_total_usd,
  ]);
}

function buildCategories(models: AggregateDataset["models"]): CategoryDefinition[] {
  const categoryCounts = new Map<string, number>();

  for (const model of models) {
    for (const evalResult of model.results.per_eval) {
      const categoryId = evalResult.category;
      categoryCounts.set(categoryId, (categoryCounts.get(categoryId) ?? 0) + 1);
    }
  }

  const modelCount = models.length;

  return Array.from(categoryCounts.entries())
    .map(([categoryId, totalEvalCount]) => ({
      id: categoryId,
      name: humanizeCategoryId(categoryId),
      iconKey: categoryId,
      order: CATEGORY_ORDER[categoryId] ?? 999,
      evalCount: Math.round(totalEvalCount / modelCount),
    }))
    .sort((left, right) => left.order - right.order || left.name.localeCompare(right.name));
}

function summarizeModel(
  model: AggregateDataset["models"][number],
  categories: CategoryDefinition[],
  warnings: string[],
): ModelSummary {
  const categoryMap = new Map<string, CategoryScore>();

  for (const category of categories) {
    categoryMap.set(category.id, {
      categoryId: category.id,
      categoryName: category.name,
      iconKey: category.iconKey,
      evalCount: 0,
      evals: [],
      scorePct: 0,
      contributionPct: 0,
      tokensUsed: 0,
      costUsd: null,
    });
  }

  const requirementsTotal = model.results.model_summary.requirements_total;

  if (model.results.per_eval.length !== model.results.model_summary.num_evals) {
    warnings.push(
      `${model.modelId}: num_evals (${model.results.model_summary.num_evals}) does not match per_eval length (${model.results.per_eval.length})`,
    );
  }

  for (const evalResult of model.results.per_eval) {
    const category = categoryMap.get(evalResult.category);

    if (!category) {
      warnings.push(`${model.modelId}: unknown category ${evalResult.category} from ${evalResult.eval_id}`);
      continue;
    }

    const evalScore: EvalScore = {
      evalId: evalResult.eval_id,
      categoryId: evalResult.category,
      name: evalNameFromId(evalResult.eval_id),
      scorePct: toPercent(evalResult.score_median),
      tokensUsed: evalResult.tokens_median,
      costUsd: pickEvalDisplayCostUsd(evalResult),
      requirementsTotal: evalResult.requirements_total,
    };

    category.evals.push(evalScore);
    category.evalCount += 1;
  }

  for (const category of categoryMap.values()) {
    const requirementsInCategory = category.evals.reduce(
      (acc, evalScore) => acc + evalScore.requirementsTotal,
      0,
    );

    const weightedScoreSum = category.evals.reduce(
      (acc, evalScore) => acc + evalScore.scorePct * evalScore.requirementsTotal,
      0,
    );

    if (requirementsInCategory > 0) {
      category.scorePct = weightedScoreSum / requirementsInCategory;
    } else {
      warnings.push(`${model.modelId}/${category.categoryId}: requirements_total is 0`);
      category.scorePct = 0;
    }

    category.tokensUsed = Math.round(
      category.evals.reduce((acc, evalScore) => acc + evalScore.tokensUsed, 0),
    );
    category.costUsd = category.evals.every((evalScore) => evalScore.costUsd !== null)
      ? category.evals.reduce((acc, evalScore) => acc + (evalScore.costUsd ?? 0), 0)
      : null;

    if (requirementsTotal > 0) {
      category.contributionPct = weightedScoreSum / requirementsTotal;
    }

    category.evals.sort((left, right) => left.evalId.localeCompare(right.evalId));
  }

  return {
    id: model.modelId,
    label: model.label,
    solverModel: model.results.model_summary.solver_model,
    overallScorePct: toPercent(model.results.model_summary.weighted_avg_score),
    tokensUsed: Math.round(model.results.model_summary.tokens_total / model.results.model_summary.n_runs),
    costUsd: pickPreferredCostUsd([
      model.results.model_summary.api_estimated_cost_total_usd,
      model.results.model_summary.effective_cost_total_usd,
    ]),
    requirementsPassed: model.results.model_summary.requirements_passed,
    requirementsTotal,
    categories: Object.fromEntries(categoryMap.entries()),
  };
}

function buildEvalMatrix(models: ModelSummary[]): Record<string, EvalMatrixEntry[]> {
  const matrix = new Map<string, EvalMatrixEntry[]>();

  for (const model of models) {
    for (const category of Object.values(model.categories)) {
      for (const evalScore of category.evals) {
        const entries = matrix.get(evalScore.evalId) ?? [];
        entries.push({
          modelId: model.id,
          modelLabel: model.label,
          scorePct: evalScore.scorePct,
          tokensUsed: Math.round(evalScore.tokensUsed),
          costUsd: evalScore.costUsd,
          requirementsTotal: evalScore.requirementsTotal,
        });
        matrix.set(evalScore.evalId, entries);
      }
    }
  }

  for (const entries of matrix.values()) {
    entries.sort((left, right) => {
      if (right.scorePct !== left.scorePct) {
        return right.scorePct - left.scorePct;
      }

      return left.tokensUsed - right.tokensUsed;
    });
  }

  return Object.fromEntries(matrix.entries());
}

export function normalizeDashboardData(dataset: AggregateDataset): DashboardData {
  const warnings: string[] = [];
  const categories = buildCategories(dataset.models);
  const runCounts = dataset.models.map((model) => model.results.model_summary.n_runs);
  const runCount = runCounts[0] ?? 0;
  const nowIso = new Date().toISOString();

  if (runCounts.some((count) => count !== runCount)) {
    warnings.push(`Run count mismatch across models: ${runCounts.join(", ")}`);
  }

  const models = dataset.models
    .map((model) => summarizeModel(model, categories, warnings))
    .sort((left, right) => right.overallScorePct - left.overallScorePct);

  return {
    categories,
    judgeModel: "unknown",
    runStartedAt: nowIso,
    runFinishedAt: nowIso,
    runCount,
    warnings,
    models,
    evalMatrixById: buildEvalMatrix(models),
  };
}
