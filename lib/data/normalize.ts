import {
  type CategoryDefinition,
  type CategoryScore,
  type DashboardData,
  type EvalScore,
  type JudgeDataset,
  type ModelSummary,
  type RequirementScore,
} from "@/lib/types/evals";
import { calculateEvalScore } from "@/lib/scoring/calculate-scores";

const CATEGORY_ORDER: Record<string, number> = {
  navigation: 1,
  animation: 2,
  "async-state": 3,
  "expo-sdk": 4,
};

const CATEGORY_LABELS: Record<string, string> = {
  navigation: "Navigation",
  animation: "Animation",
  "async-state": "Async State",
  "expo-sdk": "Expo SDK",
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

function categoryIdFromEvalPath(evalPath: string): string {
  const parts = evalPath.split("/");
  return parts[1] ?? "uncategorized";
}

function toRequirementScore(status: boolean, requirementId: string, description: string, confidence?: number): RequirementScore {
  return {
    requirementId,
    description,
    status: status ? "pass" : "fail",
    confidence,
  };
}

function buildCategories(models: JudgeDataset["models"]): CategoryDefinition[] {
  const categoryCounts = new Map<string, number>();

  for (const model of models) {
    for (const evalResult of model.evals) {
      const categoryId = categoryIdFromEvalPath(evalResult.evalPath);
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
  model: JudgeDataset["models"][number],
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
      passedWeight: 0,
      totalWeight: 0,
      scorePct: 0,
    });
  }

  for (const evalResult of model.evals) {
    const categoryId = categoryIdFromEvalPath(evalResult.evalPath);
    const category = categoryMap.get(categoryId);

    if (!category) {
      warnings.push(`${model.modelId}: unknown category ${categoryId} from ${evalResult.evalPath}`);
      continue;
    }

    const requirements = evalResult.llmJudgeRequirements.map((requirement) =>
      toRequirementScore(
        requirement.passed,
        requirement.id,
        requirement.description,
        requirement.confidence,
      ),
    );

    const evalScore: EvalScore = {
      evalId: evalResult.evalId,
      evalPath: evalResult.evalPath,
      name: evalNameFromId(evalResult.evalId),
      outputFiles: evalResult.outputFiles,
      requirements,
      passedWeight: evalResult.score.passedWeight,
      totalWeight: evalResult.score.totalWeight,
      scorePct: calculateEvalScore(evalResult.score.passedWeight, evalResult.score.totalWeight),
    };

    category.evals.push(evalScore);
    category.evalCount += 1;
    category.passedWeight += evalResult.score.passedWeight;
    category.totalWeight += evalResult.score.totalWeight;
  }

  for (const category of categoryMap.values()) {
    if (category.totalWeight <= 0) {
      warnings.push(`${model.modelId}/${category.categoryId}: totalWeight is 0`);
      category.scorePct = 0;
      continue;
    }

    category.scorePct = calculateEvalScore(category.passedWeight, category.totalWeight);
    category.evals.sort((left, right) => left.evalId.localeCompare(right.evalId));
  }

  return {
    id: model.modelId,
    label: model.label,
    solverModel: model.summary.solverModel,
    overallScorePct: model.summary.weightedAverageScore * 100,
    requirementsPassed: model.summary.requirementsPassed,
    requirementsTotal: model.summary.requirementsTotal,
    categories: Object.fromEntries(categoryMap.entries()),
  };
}

export function normalizeDashboardData(dataset: JudgeDataset): DashboardData {
  const warnings: string[] = [];
  const categories = buildCategories(dataset.models);

  const models = dataset.models
    .map((model) => summarizeModel(model, categories, warnings))
    .sort((left, right) => right.overallScorePct - left.overallScorePct);

  const judgeModel = dataset.models[0]?.summary.judgeModel ?? "unknown";
  const runStartedAt = dataset.models
    .map((model) => model.summary.startedAt)
    .sort()[0] ?? "";
  const runFinishedAt = dataset.models
    .map((model) => model.summary.finishedAt)
    .sort()
    .at(-1) ?? "";

  return {
    categories,
    judgeModel,
    runStartedAt,
    runFinishedAt,
    warnings,
    models,
  };
}
