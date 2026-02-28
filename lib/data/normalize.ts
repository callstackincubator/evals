import {
  type DashboardData,
  type EvalCatalog,
  type EvalResult,
  type ModelEntry,
  type ModelResults,
  type RequirementStatus,
  type VariantSummary,
} from "@/lib/types/evals";
import {
  calculateCategoryScore,
  calculateDelta,
  calculateEvalScore,
  calculateOverallScore,
} from "@/lib/scoring/calculate-scores";

type VariantName = "vanilla" | "callstack";

function summarizeVariant(
  catalog: EvalCatalog,
  model: ModelEntry,
  variantName: VariantName,
  warnings: string[],
): VariantSummary {
  const variant = model.variants[variantName];
  const evalResultMap = new Map<string, EvalResult>();

  for (const evalResult of variant.evalResults) {
    evalResultMap.set(evalResult.evalId, evalResult);
  }

  const knownEvalIds = new Set<string>();

  const categories = Object.fromEntries(
    catalog.categories.map((category) => {
      const evalScores = category.evals.map((evalDef) => {
        knownEvalIds.add(evalDef.id);

        const evalResult = evalResultMap.get(evalDef.id);
        const requirementResultMap = new Map(
          (evalResult?.requirementResults ?? []).map((result) => [
            result.requirementId,
            result.status,
          ]),
        );

        for (const result of evalResult?.requirementResults ?? []) {
          const knownRequirement = evalDef.requirements.some(
            (requirement) => requirement.id === result.requirementId,
          );

          if (!knownRequirement) {
            warnings.push(
              `${model.id}/${variantName}/${evalDef.id}: unknown requirement ${result.requirementId}`,
            );
          }
        }

        const requirements = evalDef.requirements.map((requirement) => {
          let status = requirementResultMap.get(requirement.id);

          if (!status) {
            warnings.push(
              `${model.id}/${variantName}/${evalDef.id}: missing result for ${requirement.id} (counted as fail)`,
            );
            status = "fail";
          }

          return {
            requirementId: requirement.id,
            text: requirement.text,
            status: status as RequirementStatus,
          };
        });

        const passedRequirements = requirements.filter((item) => item.status === "pass").length;
        const totalRequirements = requirements.length;

        return {
          evalId: evalDef.id,
          name: evalDef.name,
          prompt: evalDef.prompt,
          requirements,
          passedRequirements,
          totalRequirements,
          scorePct: calculateEvalScore(passedRequirements, totalRequirements),
        };
      });

      const passedRequirements = evalScores.reduce(
        (acc, evalScore) => acc + evalScore.passedRequirements,
        0,
      );
      const totalRequirements = evalScores.reduce(
        (acc, evalScore) => acc + evalScore.totalRequirements,
        0,
      );

      return [
        category.id,
        {
          categoryId: category.id,
          categoryName: category.name,
          iconKey: category.iconKey,
          evalCount: category.evals.length,
          evals: evalScores,
          passedRequirements,
          totalRequirements,
          scorePct: calculateCategoryScore(evalScores.map((item) => item.scorePct)),
        },
      ];
    }),
  ) as VariantSummary["categories"];

  for (const evalResult of variant.evalResults) {
    if (!knownEvalIds.has(evalResult.evalId)) {
      warnings.push(`${model.id}/${variantName}: unknown eval ${evalResult.evalId}`);
    }
  }

  const categoryValues = Object.values(categories);

  const passedRequirements = categoryValues.reduce(
    (acc, category) => acc + category.passedRequirements,
    0,
  );
  const totalRequirements = categoryValues.reduce(
    (acc, category) => acc + category.totalRequirements,
    0,
  );

  return {
    categories,
    passedRequirements,
    totalRequirements,
    overallScorePct: calculateOverallScore(
      categoryValues.map((category) => ({
        scorePct: category.scorePct,
        evalCount: category.evalCount,
      })),
    ),
  };
}

export function normalizeDashboardData(catalog: EvalCatalog, modelResults: ModelResults): DashboardData {
  const warnings: string[] = [];

  const models = modelResults.models
    .map((model) => {
      const vanilla = summarizeVariant(catalog, model, "vanilla", warnings);
      const callstack = summarizeVariant(catalog, model, "callstack", warnings);

      return {
        id: model.id,
        label: model.label,
        variants: {
          vanilla,
          callstack,
        },
        deltaOverallPct: calculateDelta(vanilla.overallScorePct, callstack.overallScorePct),
        maxOverallScorePct: Math.max(vanilla.overallScorePct, callstack.overallScorePct),
      };
    })
    .sort((left, right) => right.maxOverallScorePct - left.maxOverallScorePct);

  return {
    catalog,
    generatedAt: modelResults.generatedAt,
    sourceRepoUrl: modelResults.sourceRepoUrl,
    warnings,
    models,
  };
}
